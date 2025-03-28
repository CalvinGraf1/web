import express from 'express';
import cookieParser from 'cookie-parser';
import { EventEmitter } from 'events';
import { getUserByName, getConversationById, Message, Conversation, User } from './data.js';
import { conversationNotFoundError, emptyMessageError, userNotInConversationError } from './errors.js';

// Ajout
import xss from 'xss';
import bcrypt from "bcrypt";
import passport from 'passport';
import { Strategy as strategy } from 'passport-local';
import session from 'express-session';
import { saltRounds } from './constants.js';

const app = express();

// Ajout
app.use(session({ secret: 'WEB_LABO7_HEIG2024', resave: false, saveUninitialized: false }));
app.use(passport.initialize());
app.use(passport.session());

passport.use(new strategy((username, password, done) => {
        getUserByName(username).then((userData) => {
            if (userData) {
                if (bcrypt.compareSync(password, userData.password)) return done(null, userData)
                return done(null, false, {message: 'Username or password is invalid'});
            }
            else {
                bcrypt.compareSync('test', bcrypt.genSaltSync(saltRounds))
                return done(null, false, {message: 'Username or password is invalid'});
            }
        });
    }
));

passport.serializeUser((userData, done) => {
    done(null, userData.username);
});

passport.deserializeUser(async (name, done) => {
    try {
        const userData = await getUserByName(name);
        done(null, userData);
    } catch (e) {
        done(e, null);
    }
});



let emitter = new EventEmitter()

// Configure express
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(cookieParser());
app.set('view engine', 'ejs');

app.use(express.static('public'));

// Log all requests to console
app.use('/', (req, res, next) => {
    console.log("Request for " + req.originalUrl);
    next()
})

// Handle browser trying to fetch favicon
app.get('/favicon.ico', (req, res) => res.status(204));

// Serve login page
app.get('/login', (req, res) => {
    let errorMessage = xss.filterXSS(req.query.error)
    res.render('login', { errorMessage });
})

// Extract username and password from login request
app.post('/login', passport.authenticate('local', {
    successRedirect: '/',
    failureRedirect: '/login?error=Username or password is invalid',
    failureFlash: false
}));

// Authentication middleware
app.use(async (req, res, next) => {
    console.log("Auth middleware")

    // Extracting from cookies if not already extracted (from /login)
    if (!req.username && !req.password) {
        console.log("Getting credentials from cookies: " + JSON.stringify(req.cookies))
        req.username = req.cookies.username;
        req.password = req.cookies.loginId;
    }

    let username = req.username;
    let password = req.password;

    if (password && username) {
        await getUserByName(username).then(
            async (user) => {
                if (user.password === password) {
                    // Set the cookie with session expiration
                    setLoginCookie(res, username, password);

                    req.user = user;
                } else {

                    console.log(`User ${username} has wrong login key ${password}`)
                    // Waiting 1 second to prevent bruteforce
                    await new Promise((resolve) => setTimeout(resolve, 1000))
                }
            },
            () => {
                console.log(`User ${username} not found`)
            })
    } else {
        console.log(`No username or password provided`)
    }
    next();
});

// TODO
function isLogged(req, res, next) {
    if (req.isAuthenticated()) return next();
    res.redirect('/login?error=You need to login first');
}

app.all('/logout', isLogged, (req, res) => {
    req.logout(() => { res.redirect("/login"); });
})

app.all('/logout', (req, res, next) => {
    if (req.isAuthenticated()) {
        req.logout(() => {
            res.redirect("/login");
        });
    }
    else res.redirect('/login?error=You need to login');
});


// SSE notifications of new messages
app.get("/notifications", isLogged, (req, res) => {
    let user = req.user;
    console.log(`Received notifications request from ${user.username}`);

    res.setHeader("Content-Type", "text/event-stream");
    res.setHeader("Cache-Control", "no-cache");
    res.setHeader("Connection", "keep-alive");
    res.setHeader("Access-Control-Allow-Origin", "*");

    const onMessage = (message) => {
        console.log(`event emission received, sending notification to ${user.username}`);
        res.write(`data: ${JSON.stringify(message)}\n\n`);
    };

    emitter.addListener("message::" + user.id, onMessage);

    console.log(`Listeners for ${user.username}: ${emitter.listenerCount("message::" + user.id)}`);

    req.on("close", () => {
        console.log(`Notification connection closed for ${user.username}`);
        emitter.removeListener("message::" + user.id, onMessage);
    });
});

function convertConvsForRender(user) {
    return user.getConversations()
        .then((conversations) => Promise.all(conversations.map(async (conversation) => {
            let other = await conversation.getOtherUser(user);
            let lastMessage = await conversation.getLastMessage();
            return {
                uid: conversation.id,
                otherUser: other,
                lastMessage: lastMessage,
            }
        })));
}

// Serve index page
app.get('/', isLogged, async (req, res) => {
    let user = req.user;
    let conversations = await convertConvsForRender(user)

    res.render('index', { currentUser: user, conversations, mainConvUid: undefined, mainConvMessages: [] });
});

// Conversation authorization middleware
app.use('/conversation/:conversationId', isLogged, async (req, res, next) => {
    let user = req.user;
    getConversationById(req.params.conversationId).then(
        (conversation) => {

            if (!conversation.hasUser(user)) {
                console.log(`Trying to get another user's conversation. Requester is ${user.username} (${user.id}))`)
                res.status(403).json(userNotInConversationError(user, conversation))
                return
            }

            req.conversation = conversation;
            next();
        })
        .catch(() => {
            res.status(404).send(conversationNotFoundError());
        });
});

// Getting a full conversation
app.get("/conversation/:conversationId", isLogged, async (req, res) => {
    let user = req.user
    let mainConvMessages = await req.conversation.getMessages()
    let mainConvUid = req.conversation.id
    let conversations = await convertConvsForRender(user)

    res.render('index', { currentUser: user, conversations, mainConvUid, mainConvMessages })
})

// Posting a message
app.post("/conversation/:conversationId", isLogged, async (req, res) => {
    let user = req.user
    let mainConversation = req.conversation
    let message = xss.filterXSS(req.body.message);

    const other = await mainConversation.getOtherUser(user)

    if (message.length == 0) {
        res.status(403).json(emptyMessageError(user, other))

        return
    }

    // Wait for a second, to avoid spamming if they manage to create a loop.
    await new Promise(resolve => setTimeout(resolve, 500));

    await mainConversation.addMessage(user.id, message);

    emitter.emit("message::" + user.id, [{ conversationId: mainConversation.id, fromMe: true, message }]);
    emitter.emit("message::" + other.id, [{ conversationId: mainConversation.id, fromMe: false, message }]);

    res.status(200).send("Message sent")
})

// Allow clearing all conversations
app.get("/clear", isLogged ,async (req, res) => {
    let user = req.user

    await user.clearAllConversations();

    for (let conv of await user.getConversations()) {
        let other = await conv.getOtherUser(user);
        emitter.emit("message::" + other.id, {});
    }

    res.redirect("/")
})

// Allow changing display name
app.post("/displayname", isLogged, (req, res) => {
    let user = req.user
    let displayName = req.body.displayName;
    console.log(`Asked to change display name to ${displayName}`)
    user.changeDisplayName(displayName);
    emitter.emit("message::" + user.id, {});

    res.redirect("/")
})

export default app;
