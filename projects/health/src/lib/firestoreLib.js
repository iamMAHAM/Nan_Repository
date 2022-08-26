
import { db } from "./firebaseConfig";
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword } from "firebase/auth"
import { collection, doc, addDoc, getDoc, getDocs, where, query, deleteDoc, setDoc, collectionGroup } from "firebase/firestore"; 

const auth = getAuth()

export const getOne = async (collect="", id="", callback=null)=>{
    const docRef = doc(db, collect, id)
    const docSnap = await getDoc(docRef)
	let toPush = docSnap.data()
	toPush.id = docSnap.id
	console.log(toPush)
	return callback(toPush)
}

export const getAll = async (collect, callback)=>{
    let result = []
    const querySnapshot = await getDocs(collection(db, collect))
    querySnapshot.forEach((doc) => {
        let toPush = doc.data()
        toPush.id = doc.id
        result.push(toPush)
    })
    return callback(result)
}
export const searchEveryWhere = (
		root_path,
		categories,
		property,
		queryString,
		callback) =>{
			let inter = []
			categories.forEach(async (cat)=>{
				await getAll(`${root_path}/${cat}`, (data)=>{
					const filtered = data.filter(el => el[property] ? el[property].toLowerCase().includes(queryString.toLowerCase()) : '')
					filtered.length ? inter.push(...filtered) : null
					}
				)
			})
			return callback(inter)
}
export const saveDoc = async (collect="", doc, callback)=>{
    const docRef = await addDoc(collection(db, collect), doc)
	return callback(docRef.id)
}

export const saveOrOverride = async(collect, id, doct, callback)=>{
	const docRef = await setDoc(doc(db, collect, id), doct)
	return callback()
}
export const saveDocs = (collect="", docs=[])=>{
    // Add a new document with a generated id.
    docs.forEach(async (doc) =>{
        const docRef = await addDoc(collection(db, collect), doc)
        console.log(docRef.id)
    })
}

export const unSaveDoc = async (collect="", doct)=>{
    await deleteDoc(doc(db, collect, doct))
	console.log("doc with", doct, "deleted")
}

export const signUp = (data, callback)=>{
    console.log(data)
    createUserWithEmailAndPassword(auth, data.email, data.password)
    .then(userCredential=>{
        console.log(userCredential)
        saveDoc("users", data)
    }).catch(e=> {return callback(e.code)})
}

export const signIn = async (data, callback)=>{
    let result = {
        user: null,
        error: null
    }
    signInWithEmailAndPassword(auth, data.email, data.password)
    .then(async (user)=>{
        const users = collection(db, "users")
        const q = query(users, where("email", "==", data.email))
        const querySnapshot = await getDocs(q)
        console.log("query", querySnapshot)
        querySnapshot.forEach(doc=>{
            let user = doc.data()
            user["id"] = doc.id
            result.user = user
        })
        return callback(result)
    })
    .catch(err=>{
        result.error = err.code
        return callback(result)
    })
}