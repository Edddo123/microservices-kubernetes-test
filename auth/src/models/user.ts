import mongoose from "mongoose";
import { Password } from "../services/password";

// an interface that describes properties required to create new user
interface UserAttrs {
  email: string;
  password: string;
}

// an interface that describes properties of User model

interface UserModel extends mongoose.Model<UserDoc> {
  // so its what we provide we need UserDoc in case mognoose adds extra properties like createdAt and updatedAt
  build(attrs: UserAttrs): UserDoc;
}

// an interface describes properties that User Document has(so if we have extra properties like createdat and updatedat)

interface UserDoc extends mongoose.Document {
  email: string;
  password: string;
  //   createdAt: string; if we had those properties we would add them here
  //   updatedAt: string
}

const UserSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: true,
    },
    password: {
      type: String,
      required: true,
    },
  },
  {
    toJSON: {
      transform(doc, ret) { // so here basically when sending user object and turning it into JSON we remove some fields and rename _id to id since thats how it usually is in dbs. So now user object, olny when stringified(so basically before sending it as a response) will send data in this manner. It actually can be used in normal js objects in similar manner
        ret.id = ret._id;
        delete ret._id;
        delete ret.password;
        delete ret.__v;
      },
    },
  }
);

// presave hook
UserSchema.pre("save", async function (done) {
  // we donbt use arroy function to access this in context of UserSchema
  if (this.isModified("password")) {
    // so here we only hash password if it has been modified so lets say we change email and it does pre save, it would rehash it
    const hashed = await Password.toHash(this.get("password"));
    this.set("password", hashed);
  }
  done();
});

UserSchema.statics.build = (attrs: UserAttrs) => {
  // adding custom function to model of a mongoose but we need to give typescript bit more info
  return new User(attrs);
};

const User = mongoose.model<UserDoc, UserModel>("User", UserSchema);
// so to mongoose model u can provide optionally two generic types first is for document and 2nd is user model, so now User is of type UserModel which has build function and document created by this build will have type of UserDoc

// const user = User.build({ now we get UserDoc object
//   email: "123",
//   password: "123",
// });

// const buildUser = (attrs: UserAttrs) => {
//   return new User(attrs); // adding extra step so typescript checks it
// };

// buildUser({ // now typescript checks if we add correct properties
//     email: "sdas",
//     password: "1231"
// })

// new User({ Typescript has no idea what is going on so it cant check anything so we will teach typescript about mongoose
//   email: "test.testcom",
//   passwrod: "12312",
//   adssad: 12
// });

export { User };
