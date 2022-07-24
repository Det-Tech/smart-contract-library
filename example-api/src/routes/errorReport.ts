import express from "express";
import { initializeApp } from 'firebase/app';
import { getDatabase, ref, query, onValue, equalTo, orderByChild } from "firebase/database";
import firebaseConfig from "../firebaseConfig.json";
// Imports the Google Cloud client library
import { ErrorReporting } from "@google-cloud/error-reporting";

const router = express.Router();

const firebaseConfigJson = firebaseConfig as Record<string, string>;
const firebaseApp = initializeApp(firebaseConfigJson);

// Instantiates a client
const errorsClient = new ErrorReporting({
  projectId: 'web3-error-reporting',
  keyFilename: './src/serviceAccountKey.json',
  reportMode: 'always',
});

// register or search error
router.post("/error_report/:projectId/:errorCode", async (req, res) => {
  const { projectId, errorCode } = req.params;
  const { walletAddress, functionName } = req.body;
  const db = getDatabase(firebaseApp);
  const errorRef = query(ref(db, 'errors'), orderByChild('projectId'), equalTo(projectId));
  let error: Record<string, string>;

  onValue(errorRef, (snapshot) => {
    const errors = snapshot.val();

    for (let key in errors ) {
      let value: Record<string, string> = errors[key];
      if (value.code == errorCode ) {
        error = value;
        break;
      }
    }

    if (error) {
      let additionalDetails: string = error.description + " / " + errorCode + " / " + functionName;
      const errorEvt = errorsClient.event().setMessage(additionalDetails).setUser(walletAddress);
      errorsClient.report(errorEvt);
      res.json({ error });
    } else {
      errorsClient.report(new Error("Non-defined error!"));
      res.json({ status: "Non-defined error!" });
    }
  });
});

export default router;
