export interface userInfo {
    id: String;
    firstname: String;
    lastname: String;
    email: String;
    birthdate: Date;
    phone:String;
    gender:String;
    registrationdate:Date;
    roles: Role[]; // Add the roles property here
  }
  
  export interface Role {
    id: number;
    name: string;
  }