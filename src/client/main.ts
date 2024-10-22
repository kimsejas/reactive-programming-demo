import {fromEvent, map, tap, merge, shareReplay, share} from "rxjs";
import {serverMessages$, sendMessage} from "./connection";

const form = document.getElementById("form")!;
const userMessages$ = fromEvent<FormDataEvent>(form, 'submit').pipe(
    tap((e:Event) => {
        e.preventDefault()
    }), 
    tap(x => console.log(x)),
    map((e:Event) =>{
        const messageInput: HTMLInputElement = ((e.currentTarget as HTMLFormElement).querySelector('input[name="message"]')!);
        const message = messageInput.value;
        messageInput.value = ""; /*Note: this is a side-effect!*/
        return message;
    }), 
    map((message: string): Message => {
        return {data: message, action: "sent", timestamp: new Date()};
    }),
    shareReplay()
);
const messages$ = merge(userMessages$, serverMessages$);

messages$.subscribe(message =>{
    const newMessage = document.createElement("li");
    newMessage.innerHTML = `
        <div>
            <p class="message-text">${message.data}</p>
            <p class="message-date">${message.action} ${new Date(message.timestamp).toLocaleString()}</p>
        </div>
    `;
    newMessage.classList.add(message.action);
    document.getElementById("messages")!.appendChild(newMessage);
});

userMessages$.subscribe(message => {
    sendMessage(message)
});