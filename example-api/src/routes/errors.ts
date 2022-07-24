import express from "express";
import { initializeApp } from 'firebase/app';
import { getDatabase, ref, push, set, remove, update, query, orderByChild, equalTo, onValue } from "firebase/database";
import firebaseConfig from "../firebaseConfig.json";
import createKeccakHash from "keccak";

const router = express.Router();

const firebaseConfigJson = firebaseConfig as Record<string, string>;
const firebaseApp = initializeApp(firebaseConfigJson);

// register or search error
router.post("/errors", async (req, res) => {
  const db = getDatabase(firebaseApp);

  if (req.body?.action == "register") {
    if (req.body?.useAbi == 1) {
      let abi = JSON.parse(req.body.abi);
      const updates: any = {};
      const errorListRef = ref(db, 'errors');
      for (let value of abi) {
        if (value.type === "error") {
          let name = value.name;
          name += "(";
          let length = value.inputs.length;
          if (length > 0) {
            for (let i = 0; i < length - 1; i++) {
              name += value.inputs[i].type + ",";
            }
            name += value.inputs[length - 1].type;
          }          
          name += ")";
          const code = "0x" + createKeccakHash('keccak256').update(name).digest('hex').slice(0, 8);
          const newErrorId = push(errorListRef).key;
          updates['errors/' + newErrorId] = {
            code: code,
            name: name,
            projectId: req.body.projectId
          }
        }
      }
      update(ref(db), updates);
    } else {
      const errorListRef = ref(db, 'errors');
      const newErrorRef = push(errorListRef);
      set(newErrorRef, {
        code: req.body.code,
        name: req.body.name,
        description: req.body.description,
        projectId: req.body.projectId
      });
    }
    res.json({ status: "success" });
  }
  if (req.body?.action == "search") {
    const errorListRef = query(ref(db, 'errors'), orderByChild('projectId'), equalTo(req.body.projectId));
    onValue(errorListRef, (snapshot) => {
      const errorList = snapshot.val();
      res.json({ errorList });
    });
  }
});

// get error by id
router.get("/errors/:id", async (req, res) => {
  const db = getDatabase(firebaseApp);
  const errorRef = query(ref(db, 'errors/' + req.params.id));
  onValue(errorRef, (snapshot) => {
    const error = snapshot.val();
    res.json({ error });
  });
});

// update error by id
router.put("/errors/:id", async (req, res) => {
  const db = getDatabase(firebaseApp);
  const newError = {
    code: req.body.code,
    name: req.body.name,
    description: req.body.description,
    projectId: req.body.projectId
  };
  const updates: any = {};
  updates['errors/' + req.params.id] = newError;

  update(ref(db), updates);
  res.json({ status: "success" });
});

// delete error by id
router.delete("/errors/:id", async (req, res) => {
  const db = getDatabase(firebaseApp);
  const errorRef = ref(db, 'errors/' + req.params.id);
  remove(errorRef);
  res.json({ status: "success" });
});

export default router;
