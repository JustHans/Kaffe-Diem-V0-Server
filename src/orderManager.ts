import { WSServer, Client } from "./serverV2";


export class Order{
    id;
    isReady;
    customerName;
    order;

    constructor(id:String, customerName:String, order:String){
        this.id = id;
        this.customerName = customerName;
        this.isReady = false;
        this.order = order;
    }
}

export class OrderManager{
    private orders: Array<Order>;
    private wss: WSServer;

    constructor(wss: WSServer){
        this.orders = new Array<Order>();
        this.wss = wss;
    }

    AddNewOrder(name:String, order:String) : Order{
        var newID = this.generateID();

        var newOrder = new Order(newID, name, order)
        this.orders.push(newOrder);

        this.UpdateOrders()

        return newOrder;
    }
    CompleteOrder(ID:String){
        this.orders.forEach(order => {
            if(order.id == ID){
                order.isReady = true
            }
        })

        this.UpdateOrders()
    }
    RemoveOrder(ID:String){
        this.orders = this.orders.filter((order) => order.id != ID);

        console.log("Removing order: " + ID);

        this.UpdateOrders()
    }

    sendOrdersToClient(client: Client){
        client.sendMessage(JSON.stringify({
            type:"UPDATEORDERS",
            data:{
                orders: this.orders
            }
        }))
    }

    GetOrders() : Array<Order>{
        return this.orders;
    }

    UpdateOrders(){
        this.wss.updateClientsOrders()
    }

    generateID() : String{
        var ID = "___"
        var indexIncrement = 0;

        var gotValidID = false;
        while(!gotValidID){
            var hour = Math.round(new Date().getHours() / 3)
            ID = hour.toString() + (this.orders.length + 10 + indexIncrement).toString();
            
            if(!this.orders.find(order => order.id == ID)){
                gotValidID = true;
            }
            else{
                indexIncrement += 1;
            }
        }
        
        return ID;
    }
}