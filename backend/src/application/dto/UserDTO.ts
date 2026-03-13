// Data Transfer Objects - Used to transfer data between layers

export class CreateUserDTO {
  name: string;
  email: string;
  password: string;

  constructor(data: { name: string; email: string; password: string }) {
    this.name = data.name;
    this.email = data.email;
    this.password = data.password;
  }
}

export class UserResponseDTO {
  id: string;
  name: string;
  email: string;
  createdAt: Date;
  updatedAt: Date;

  constructor(data: {
    id: string;
    name: string;
    email: string;
    createdAt: Date;
    updatedAt: Date;
  }) {
    this.id = data.id;
    this.name = data.name;
    this.email = data.email;
    this.createdAt = data.createdAt;
    this.updatedAt = data.updatedAt;
  }
}

export class LoginDTO {
  email: string;
  password: string;

  constructor(data: { email: string; password: string }) {
    this.email = data.email;
    this.password = data.password;
  }
}

export class LoginResponseDTO {
  id: string;
  name: string;
  email: string;
  token: string;
  refreshToken: string;

  constructor(data: {
    id: string;
    name: string;
    email: string;
    token: string;
    refreshToken: string;
  }) {
    this.id = data.id;
    this.name = data.name;
    this.email = data.email;
    this.token = data.token;
    this.refreshToken = data.refreshToken;
  }
}
