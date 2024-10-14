import { Client } from "../serverV2";
import { SetAccountRole } from "../accountManager";
import { Command } from "./commandManager";
import { Role } from "../accountManager";

//Takes a username as parameter. Promotes or Demotes this user to EMPLOYEE Role
interface iPromoteDemoteDataFormat{
    username:string;
}
export class promoteCommand implements Command{
    rolesWithAccess = [Role.ADMIN];

    execute(client: Client, id:string, data: iPromoteDemoteDataFormat): void {
        SetAccountRole(data.username, Role.EMPLOYEE)
    }
}
export class demoteCommand implements Command{
    rolesWithAccess = [Role.ADMIN];

    execute(client: Client, id:string, data: iPromoteDemoteDataFormat): void {
        SetAccountRole(data.username, Role.USER)
    }
}