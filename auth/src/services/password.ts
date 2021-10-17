import { scrypt, randomBytes } from "crypto";
import { promisify } from "util";

const scryptAsync = promisify(scrypt);

export class Password {
  static async toHash(password: string) {
    const salt = randomBytes(8).toString("hex");
    const buf = (await scryptAsync(password, salt, 64)) as Buffer; // it got messed up during promisify so we tell typescript to treat it as Buffer

    return `${buf.toString("hex")}.${salt}`;
  }
  static async compare(storedPasswrod: string, suppliedPassword: string) {
    const [hashedPasswrod, salt] = storedPasswrod.split("."); // we have password stored as pwd and salt
    const buf = (await scryptAsync(suppliedPassword, salt, 64)) as Buffer;

    return buf.toString("hex") === hashedPasswrod

  }
}
