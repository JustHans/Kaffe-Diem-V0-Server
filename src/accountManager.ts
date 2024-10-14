import fs from "fs";

interface iAccountList{
    accounts:iAccount[]
}
interface iAccount{
    username:String;
    password:String;
    role:Role;
}

//Simple role system. Each Role shall have different access and functionality
export enum Role{
    ADMIN = 1,
    EMPLOYEE = 2,
    USER = 3
}

export function attemptLogin(username:String, password:String) : Boolean {
    var data = fs.readFileSync("src/accounts.json");

    var accounts = (JSON.parse(data.toString()) as iAccountList).accounts;

    for(var account of accounts){
        if(account.username == username){
            if(account.password == password){
                console.log("User " + username + " logged in")
                return true
            }
            else{
                return false
            }
        }
    }

    return false
}

export function getUserRole(username:string) : Role | null{
    var accountsData = getAccountsData();

    var role = accountsData.accounts.find((account) => {
        if(account.username == username){
            return account
        }
    })?.role

    if(role){return role}
    else {return null}
}

function getAccountsData() : iAccountList{
    return (JSON.parse(fs.readFileSync("src/accounts.json").toString()) as iAccountList)
}

export function SetAccountRole(username:String, role:Role){
    var accountsData = getAccountsData();
    
    accountsData.accounts.find((account) => {
        if(account.username == username){
            account.role = role;
        }
    })

    saveAccounts(accountsData);
}

function saveAccounts(accounts:iAccountList){
    var stringifiedData = JSON.stringify(accounts);
    fs.writeFileSync("src/accounts.json", stringifiedData);
}