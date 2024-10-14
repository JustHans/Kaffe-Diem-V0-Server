//Modules
import WebSocket, { WebSocketServer } from "ws";

//Account management
import { attemptLogin, getUserRole, Role } from "./accountManager";

//Order management
import { Order, OrderManager } from "./orderManager";

//Command System
import { CommandRegistry } from "./commands/commandManager";

export class Client{
    public id: String;
    private socket: WebSocket;
    public role: Role | null;
    public isAuthenticated: boolean;

    public username: String | null;

    constructor(socket:WebSocket){
        this.id = Date.now.toString() + Math.random().toString(36).substring(2);
        this.socket = socket;
        this.role = null;
        this.isAuthenticated = false;

        this.username = null;
    }

    public sendMessage(data:String){
        this.socket.send(data)
    }

    public reply(id:string, responseData:any){
        this.socket.send(JSON.stringify({
                type:"RESPONSE",
                id:id,
                data:responseData
            }))
    }

    public sendError(id:string, errorMessage:string){
        this.socket.send(JSON.stringify({
                type:"ERROR",
                id:id,
                data:{errorMessage:errorMessage}
            }))
    }
}

export class WSServer{
    private wss: WebSocketServer;
    private clients: Map<String, Client>;
    private commandRegistry: CommandRegistry;
    private orderManager: OrderManager;

    constructor(port:number){
        this.wss = new WebSocket.Server({ port });
        this.clients = new Map();

        this.orderManager = new OrderManager(this);
        this.commandRegistry = new CommandRegistry(this.orderManager);

        console.log("\nStarting server on port " + port + "\n")

        this.wss.on('connection', (ws) => {this.handleConnection(ws)})
    }

    private handleConnection(webSocket: WebSocket){
        var client = new Client(webSocket);
        this.clients.set(client.id, client)

        webSocket.on("message", (data) => {this.handleMessage(client, data.toString())})
        webSocket.on('close', () => {this.handleDisconnect(client)})
    }

    private handleMessage(client: Client, dataString:string){

        var data = JSON.parse(dataString) as iCommandBase
        
         if(!client.isAuthenticated){
            if(data.type == "login"){
                var loginData = data.data;
                if(attemptLogin(loginData.username, loginData.password)){
                    client.isAuthenticated = true;
                    client.role = getUserRole(loginData.username)
                    client.username = loginData.username;

                    client.reply(data.id, {success:true, message:"Successfully logged in!"})
                }
                else {
                    client.sendError(data.id, "Username or password incorrect");
                }
            }
            else if(data.type == "register"){
                client.reply(data.id, {success:false, message:"UNFINISHED: REGISTERING NEW ACCOUNT: " + data.data})
            }
            else{
                client.sendError(data.id, "UNAUTHORIZED")
            }
         }
         else{
            if(client.role != null){
                var command = this.commandRegistry.getCommand(data.type, client.role);
                if(command){
                    command.execute(client, data.id, data.data)
                }
                else{
                    client.sendError(data.id, "Command does not exist or user is unauthorized: " + data.type)
                }
            }
            else{
                client.sendError(data.id, "ACCOUNT HAS NO ROLE")
            }
        }
    }

    private handleDisconnect(client: Client){
        console.log("Client: " + client.username + " disconnected")
        this.clients.delete(client.id)
    }

    public updateClientsOrders(){
        this.clients.forEach(client => {
            if(client.role && client.role == Role.ADMIN || client.role || Role.EMPLOYEE){
                this.orderManager.sendOrdersToClient(client);
            }
        })
    }
}

// First-level JSON structure for all incomming commands
// <data> has a varying JSON structure depending on command type
interface iCommandBase{
    type:string;
    id:string;
    data:any;
}

new WSServer(8080);
