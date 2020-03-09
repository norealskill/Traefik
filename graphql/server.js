require("dotenv").config();

const express = require("express");
const graphqlHTTP = require("express-graphql");
const { buildSchema } = require("graphql");
const oraceldb = require("oracledb");
const dbConfig = require("./dbconfig");

const schema = buildSchema(`
type RandomDie {
    numSides: Int!
    rollOnce: Int!
    roll(numRolls: Int!): [Int]
}

type Query {
    getDie(numSides: Int): RandomDie
    getMessage(id: ID!): Message
    getHealth: String!
}

input MessageInput {
  content: String
  author: String
}

type Message {
  id: ID!
  content: String
  author: String
}

type Mutation {
  createMessage(input: MessageInput): Message
  updateMessage(id: ID!, input: MessageInput): Message
}`);

class RandomDie {
    constructor(numSides) {
        this.numSides = numSides;
    }

    rollOnce() {
        return 1 + Math.floor(Math.random() * this.numSides);
    }

    roll({ numRolls }) {
        const output = [];
        // eslint-disable-next-line no-plusplus
        for (let i = 0; i < numRolls; i++) {
            output.push(this.rollOnce());
        }
        return output;
    }
}

class Message {
    constructor(id, { content, author }) {
        this.id = id;
        this.content = content;
        this.author = author;
    }
}

const fakeDatabase = {};

const root = {
    getDie: ({ numSides }) => {
        return new RandomDie(numSides || 6);
    },
    getMessage: ({ id }) => {
        if (!fakeDatabase[id]) {
            throw new Error(`no message exists with id ${id}`);
        }
        return new Message(id, fakeDatabase[id]);
    },
    createMessage: ({ input }) => {
        let id = require("crypto")
            .randomBytes(10)
            .toString("hex");

        fakeDatabase[id] = input;
        return new Message(id, input);
    },
    updateMessage: ({ id, input }) => {
        if (!fakeDatabase[id]) {
            throw new Error(`no message exists with id ${id}`);
        }

        fakeDatabase[id] = input;
        return new Message(id, input);
    },
    getHealth: () => {
        return `Everything is super`;
    }
};

const app = express();

const extensions = ({
    document,
    variables,
    operationName,
    result,
    context
}) => {
    return { runTime: Date.now() - context.startTime };
};

app.use(
    "/graphql",
    graphqlHTTP({
        schema,
        context: { startTime: Date.now() },
        rootValue: root,
        graphiql: true,
        extensions
    })
);
app.listen(50081);
// eslint-disable-next-line no-console
console.log("Running a GraphQL API server at https://tccauley.dev/graphql");

async function run() {
    let connection;

    try {
        let sql, binds, options, result;

        connection = await oraceldb.getConnection(dbConfig);
        const stmts = ["select * from tccauley.blog_posts"];

        for (const s of stmts) {
            try {
                const result = await connection.execute(s);
                console.log(result);
            } catch (e) {
                if (express.errorNum != 942) console.error(e);
            }
        }
    } catch (err) {
        console.error(err);
    } finally {
        if (connection) {
            try {
                await connection.close();
            } catch (err) {
                console.error(err);
            }
        }
    }
}

run();
