export interface userInfo {
    firstname: String;
    lastname: String;
    email: String;
    birthdate: Date;
    phone:String;
    gender:String;
    roles: Role[]; // Add the roles property here
  }
  
  export interface Role {
    id: number;
    name: string;
  }