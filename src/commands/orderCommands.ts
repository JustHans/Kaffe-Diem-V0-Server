import { Order, OrderManager } from "../orderManager";
import { Client } from "../serverV2";
import { Command } from "./commandManager";
import { Role } from "../accountManager";

//Logic for retrieving orders from OrderManager and sending to reading client
interface iGetOrdersCommandDataFormat{
    id:string;
}
export class getOrdersCommand implements Command{
    private orderManager: OrderManager;
    public rolesWithAccess = [Role.ADMIN, Role.EMPLOYEE];

    constructor(orderManager: OrderManager){
        this.orderManager = orderManager;
    }

    execute(client: Client, id:string, data:iGetOrdersCommandDataFormat): void {
        var orders = this.orderManager.GetOrders();

        console.log("Sending: " + JSON.stringify(orders))

        client.reply(id, orders)
    }
}

//Logic for adding new orders to the list
interface iAddNewOrderDataFormat{
    order:String;
    name:String;
}
export class addNewOrderCommand implements Command{
    private orderManager: OrderManager;
    public rolesWithAccess = [Role.ADMIN, Role.EMPLOYEE];

    constructor(orderManager: OrderManager){
        this.orderManager = orderManager;
    }

    execute(client: Client, id: string, data: iAddNewOrderDataFormat): void {
        var name = data.name;
        var order = data.order;
        
        console.log("Adding " + order + " to order list")

        var newOrder = this.orderManager.AddNewOrder(name, order);

        client.reply(id, {order:newOrder})
    }
}

interface iMarkOrderAsCompleteDataFormat{
    id:string;
}
export class markOrderAsCompleteCommand implements Command{
    public rolesWithAccess = [Role.ADMIN, Role.EMPLOYEE];
    private orderManager: OrderManager;

    constructor(orderManager: OrderManager){
        this.orderManager = orderManager;
    }

    execute(client: Client, od: string, data: iMarkOrderAsCompleteDataFormat): void {
        var id = data.id;

        this.orderManager.CompleteOrder(id);

        client.reply(id, {message: "Order " + id + " was successfully marked as complete!"})
    }
}

interface iRemoveOrderDataFormat{
    id:string;
}
export class removeOrderCommand implements Command{
    public rolesWithAccess = [Role.ADMIN, Role.EMPLOYEE];
    private orderManager: OrderManager;

    constructor(orderManager: OrderManager){
        this.orderManager = orderManager;
    }

    execute(client: Client, id: string, data: iRemoveOrderDataFormat): void {
        this.orderManager.RemoveOrder(data.id);

        client.reply(id, {message: "Order " + id + " was successfully removed!"})
    }
}