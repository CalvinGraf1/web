class ServerError {
    constructor(error, reason, details) {
        this.error = error;
        this.reason = reason;
        this.details = details;
    }
}

export function userNotInConversationError(user, conversation) {
    return new ServerError(
        "Operation not permitted",
        "User is not part of the conversation",
        {
            user: {
                username: user.username,
                displayName: user.displayName,
                id: user.id,
                conversationIds: user.conversationIds,
            },
            conversation: {
                uid: conversation.uid,
                user1: conversation.user1,
                user2: conversation.user2,
                messages: conversation.getMessages(),
            },
        })
}

export function conversationNotFoundError() {
    return "Conversation not found"
}

export function emptyMessageError(user, receiver) {
    let details = {}
    if (user && receiver) {
        details = {
            message: "",
            sender: {
                username: user.username,
                displayName: user.displayName,
                id: user.id,
                conversationIds: user.conversationIds,
            },
            receiver: {
                username: receiver.username,
                displayName: receiver.displayName,
                id: receiver.id,
                conversationIds: receiver.conversationIds,
            },
        }
    }
    return new ServerError(
        "Operation not permitted",
        "Message is empty",
        details
    )
}