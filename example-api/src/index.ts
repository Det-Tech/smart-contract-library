import express from "express";
import cors from "cors";
import metadata from "./routes/metadata";
import signing from "./routes/signing";
// import mintStatus from "./routes/mintStatus";
import saleInfo from "./routes/saleInfo";
import whitelist from "./routes/whitelist";
import stats from "./routes/stats";
import projects from "./routes/projects";
import errors from "./routes/errors";
import errorReport from "./routes/errorReport";
import env from "./env";
import gasPrice, { getGasPrice } from "./routes/gasPrice";
import { fetchCollectionPrice, subscribeToMintEvents } from "./utils/web3";
import bodyParser from "body-parser";

// Add a list of allowed origins.
// If you have more origins you would like to add, you can add them to the array below.
let allowedOrigins = /.*junglefreaks.*/;

if (env.ENV === "development") {
  allowedOrigins = /.*localhost:8081/;
}

const options: cors.CorsOptions = {
  // origin: allowedOrigins,
};

const app = express();
app.use(cors(options));
app.use(express.json());

// use body-parser as middle-ware
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

app.use(metadata);
app.use(signing);
// app.use(mintStatus);
app.use(saleInfo);
app.use(whitelist);
app.use(gasPrice);
app.use(stats);
app.use(projects);
app.use(errors);
app.use(errorReport);
// app.use(cacheImages);

const port = 8080;
app.listen(port, async () => {
  getGasPrice();
  await fetchCollectionPrice();
  // subscribeToMintEvents();
  return console.log(`Server is listening on ${port}`);
});
