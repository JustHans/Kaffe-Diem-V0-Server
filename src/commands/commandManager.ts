import { getOrdersCommand, addNewOrderCommand, markOrderAsCompleteCommand, removeOrderCommand } from "./orderCommands"
import { promoteCommand, demoteCommand } from "./promotedemote"

import { Client } from "../serverV2"
import { OrderManager } from "../orderManager"
import { Role } from "../accountManager"

export default{
    getOrdersCommand,
    addNewOrderCommand,
    promoteCommand,
    demoteCommand,
    markOrderAsCompleteCommand,
    removeOrderCommand
}

export interface Command{
    rolesWithAccess: Array<Role>; // Defines what roles will be able to use the command
    execute(client: Client, id:string, data: any) : void; // The function which contains the command functionality
}

export class CommandRegistry {
    private commands = new Map<string, Command>();

    constructor(orderManager: OrderManager) {
        //Register all usable commands
        this.registerCommand("getOrders", new getOrdersCommand(orderManager));
        this.registerCommand("addNewOrder", new addNewOrderCommand(orderManager));
        this.registerCommand("completeOrder", new markOrderAsCompleteCommand(orderManager));
        this.registerCommand("removeOrder", new removeOrderCommand(orderManager));

        this.registerCommand("promote", new promoteCommand());
        this.registerCommand("demote", new demoteCommand())
    }

    registerCommand(name: string, command: Command) {
        this.commands.set(name, command);
    }

    getCommand(name: string, clientRole: Role): Command | null {
        const commandEntry = this.commands.get(name);
        if (commandEntry && commandEntry.rolesWithAccess.find((role) => role == clientRole)) {
            return commandEntry;
        }
        return null; // Insufficient access level or command not found
    }
}
