import { Parent } from './Parent.js'
import { Pagenate } from './Pagenate.js'

export class List extends Parent {

    constructor() {

        // parent class
        super();
        const peopleRef = this.database.collection('people')
        this.cities = {
            LA: {
                name: "Los Angeles",
                state: "CA",
                country: "USA",
                capital: false,
                population: 3900000,
                mylist: ['aaa', 'bbb'],
                mymap: {color: 1},
                mayor: 'Eric Garcetti',
                mayorId: 'wGfKyGYElqcvdYPBUQdT',
                mayorRef: null
            },
            SF: {
                name: "San Francisco",
                state: "CA",
                country: "USA",
                capital: false,
                population: 860000,
                mayor: 'Mark Farrell',
                mayorId: 'wbMlnBKaOJmInTQJFSqx',
            },
            DC: {
                name: "Washington, D.C.",
                state: null,
                country: "USA",
                capital: true,
                population: 680000,
                mayor: 'Muriel Bowser',
                mayorId: 'AEsEVKVqVrueRbTsuiWO'
            },
            TOK: {
                name: "Tokyo",
                state: null,
                country: "Japan",
                capital: true,
                population: 9000000,
                mayor: 'Yuriko Koike',
                mayorId: 'OdUcDXGgmW7RIq70PttQ'
            },
            BJ: {
                name: "Beijing",
                state: null,
                country: "China",
                capital: true,
                population: 21500000,
                mayor: null,
                mayorId: null
            }
        }

        // shortcat
        this.citiesData = this.selector('#citiesData')
        this.useUserId = this.selector('#use_user_id')
        this.outputData = this.selector('#outputData')
    }

    rules() {

        // create select tag
        Object.keys(this.cities).forEach(value => {
            this.citiesData.insertAdjacentHTML('beforeend', `<option value="${value}">${value}</option>`)
        })

        // change select event
        this.citiesData.addEventListener('change', event => {
            const cityeKey = event.target.value
            let data = Object.assign({}, this.cities[cityeKey]);
            if (this.useUserId.checked) {
                data.userID = this.user.uid
            }
            this.outputData.value = JSON.stringify(data, null, "    ")
        })

        // change use user id event
        this.selector('#use_user_id').addEventListener('click', event => {
            let data = JSON.parse(this.outputData.value)
            if (event.target.checked) {
                data.userID = this.user.uid
            } else {
                delete data.userID
            }
            this.outputData.value = JSON.stringify(data, null, "    ")
        })

        // declare database
        const db = this.database
        const citiesRef = db.collection("cities");
        const peopleRef = db.collection("people");

        /**
         * create event
         */
        this.selector('#create').addEventListener('click', event => {
            const key = this.citiesData.value
            let data = JSON.parse(this.outputData.value)
            if (data.mayorId) {
                data.mayorRef = peopleRef.doc(data.mayorId)
            }
            data.created = firebase.firestore.FieldValue.serverTimestamp()
            citiesRef.doc(key)
                .set(data)
                .then(result => console.log(result))
                .catch(error => this.setSnackbar(error.message, "error"))
        })

        /**
         * update event
         */
        this.selector('#update').addEventListener('click', event => {
            const key = this.citiesData.value
            let data = JSON.parse(this.outputData.value)
            if (data.mayorId) {
                data.mayorRef = peopleRef.doc(data.mayorId)
            }
            data.updated = firebase.firestore.FieldValue.serverTimestamp()
            citiesRef.doc(key)
                .update(data)
                .then(result => console.log(result))
                .catch(error => this.setSnackbar(error.message, "error"))
        })

        /**
         * delete event
         */
        this.selector('#delete').addEventListener('click', event => {
            const key = this.citiesData.value
            citiesRef.doc(key)
                .delete()
                .then(result => console.log(result))
                .catch(error => this.setSnackbar(error.message, "error"))
        })

        /**
         * list event
         */
        this.selector('#list').addEventListener('click', event => {
            citiesRef.get()
                .then(docs => {
                    const table = this.selector('#table')
                    table.textContent = '';
                    docs.forEach(doc => {
                        this.createRow(doc)
                    })
                })
                .catch(error => this.setSnackbar(error.message, "error"))
        })

        /**
         * get event
         */
        this.selector('#get').addEventListener('click', event => {
            const key = this.citiesData.value
            citiesRef.doc(key)
                .get()
                .then(doc => {
                    if (!doc.exists) {
                        this.setSnackbar('not found!', "info")
                        return
                    }
                    const table = this.selector('#table')
                    table.textContent = '';
                    this.createRow(doc)

                    const mayorRef = doc.data().mayorRef
                    console.log(mayorRef)
                    if (mayorRef) {
                        mayorRef.get().then(mayor => {
                            console.log(mayor.data())
                        })
                    }
                })
                .catch(error => this.setSnackbar(error.message, "error"))
        })
    }

    createRow(doc) {
        const data = doc.data()
        let row = `<tr>
        <td>${doc.id}</td>
        <td>${data.name}</td>
        <td>${data.state}</td>
        <td>${data.country}</td>
        <td>${data.capital}</td>
        <td>${data.population}</td>
        <td>${data.mayor}</td>
        <td>${data.mayorId}</td>
        </tr>`
        table.insertAdjacentHTML('beforeend', `<tr>${row}</tr>`)
    }

    execute() {

        // this.database.collection("cities").doc().set({
        //     name: 'okuda',
        //     userID: 'RBB1dV0NC2TVO3W6D3XgYpF0RyV2'
        // })
        //     .then(result => console.log(result))
        //     .catch(error => console.log(error))

        /* 
        コレクションリファレンスの取得
       ------------------------------------------------------------------------------
        */
        const db = this.database
        var citiesRef = db.collection("cities");

        /* 
        setをつかって挿入
        ------------------------------------------------------------------------------
        */

        //    citiesRef.doc("SF").set({
        //        name: "San Francisco", state: "CA", country: "USA",
        //        category1: 'aaa',
        //        category2: '111',
        //        capital: false, population: 860000});
        //    citiesRef.doc("DC").set({
        //        name: "Washington, D.C.", state: null, country: "USA",
        //        category1: 'aaa',
        //        category2: '222',
        //        capital: true, population: 680000});
        //    citiesRef.doc("TOK").set({
        //        name: "Tokyo", state: null, country: "Japan",
        //        category1: 'aaa',
        //        category2: '333',
        //        capital: true, population: 9000000});
        //    citiesRef.doc("BJ").set({
        //        name: "Beijing", state: null, country: "China",
        //        category1: 'bbb',
        //        category2: '111',
        //        capital: true, population: 21500000});

        /* 
        setの引数をつくってから渡す
        */

        //        var la = {
        //            capital: false,
        //            country: "USA",
        //            name: "Los Angeles",
        //            population: 3900000,
        //            state: "CA",
        //        }
        //    citiesRef.doc('LA').set(la)
        //            .then(result => {
        //                console.log(result) // undefined 
        //            })
        //            .catch(error => {
        //                console.log(error)
        //            })

        /* 
        set get refarence first
        リファレンスを取得してからセット
        */

        //    // 存在しないリファレンスを取得してもこの時点では追加されない
        //    var newRef = citiesRef.doc("NEW");
        //    citiesRef.doc('NEW').set({name: 'new!'})
        //            .then(result => {
        //                console.log(result) // undefined 
        //            })
        //            .catch(error => {
        //                console.log(error)
        //            })

        /* 
        set override
        上書き
        */

        //    citiesRef.doc('LA').set({
        //        capital: false,
        //        country: "USA",
        //        name: "Los Angeles",
        //    })
        //            .then(result => {
        //                console.log(result) // undefined
        //            })
        //            .catch(error => {
        //                console.log(error)
        //            })

        /* 
        set case merge
        マージ
        */
        //    citiesRef.doc('LA').set({
        //        population: 3900000,
        //        state: "CA",
        //        color: ['red', 'blue', 'white'],
        //        animal: {dog: 100, cat: 200},
        //    }, {merge: true})
        //            .then(result => {
        //                console.log(result) // undefined
        //            })
        //            .catch(error => {
        //                console.log(error)
        //            })

        /* 
        subcollection
        サブコレクションにセット
        */

        //    citiesRef.doc('LA').collection('animal').doc('dog').set({num: 100})
        //    citiesRef.doc('LA').collection('animal').doc('cat').set({num: 200})

        /* 
        use new document
        一意なIDで挿入
        */

        // リファレンスを無名で取得してからセットする
        //    var newRef = citiesRef.doc()
        //    newRef.set({name: 'okuda'})
        //            .then(result => console.log(result))
        //            .catch(error => console.log(error))

        /* 
        addをつかって挿入
        一意なIDで挿入
        ------------------------------------------------------------------------------
        */

        //    citiesRef.add({
        //        name: 'kohei'
        //    })
        //            .then(result => console.log(result)) // document refalence
        //            .catch(error => console.log(error))

        /* 
        update
        更新
        ------------------------------------------------------------------------------
        */

        // var laRef = citiesRef.doc('LA')
        // laRef.update({
        //     capital: true
        // })
        //     .then(result => console.log(result))
        //     .catch(error => console.log(error))

        /* 
        update add field
        フィールドのアップデート
        フィールドの追加もできる
        */
        //    citiesRef.doc('LA').update({created: new Date()})
        //            .then(result => console.log(result)})
        //            .catch(error => console.log(error)})

        /* 
        update add field object
        フィールドのオブジェクトを追加
        */

        //    citiesRef.doc('LA').update({
        //        favorites: {
        //            nickname: "City of Angels",
        //            color: 'orange'
        //        }
        //    })
        //            .then(result => console.log(result))
        //            .catch(error => console.log(error))

        /* 
        updata
        スナップショットを更新
        */
        // citiesRef.get()
        // .then(docs => {
        //     docs.forEach(doc => {
        //         doc.ref.update({created: firebase.firestore.FieldValue.serverTimestamp()})
        //     })
        // })

        /* 
        update server time stamp
        サーバータイムを値として更新
        */

        //    citiesRef.doc('LA').update({
        //        created: firebase.firestore.FieldValue.serverTimestamp(),
        //    })
        //            .then(result => console.log(result))
        //            .catch(error => console.log(error))

        /* 
        update delete field
        フィールドを削除
        */

        //    citiesRef.doc('LA').update({
        //        capital: firebase.firestore.FieldValue.delete()
        //    })
        //            .then(result => console.log(result))
        //            .catch(error => console.log(error))

        //    // update delete field object
        //    citiesRef.doc('LA').update({
        //        'favorites.color': firebase.firestore.FieldValue.delete()
        //    })
        //            .then(result => console.log(result))
        //            .catch(error => console.log(error))

        /* 
        delete
        ドキュメントの削除
        ------------------------------------------------------------------------------
        */

        //    citiesRef.doc('LA').delete()
        //            .then(result => {
        //                console.log(result) // undefined
        //            })
        //            .catch(error => {
        //                console.log(error);
        //            })

        //        // delete use batch
        //        let batch = this.database.batch();
        //        citiesRef.get()
        //                .then(docs => {
        //                    docs.forEach((doc) => {
        //                        const dogRef = doc.ref
        //                        batch.delete(doc.ref);
        //                    });
        //                    batch.commit()
        //                })

        /* 
        transaction
        トランザクション処理
        ------------------------------------------------------------------------------
        */

        /* 
        single document
        一つのドキュメント
        */

        //        // single document
        //        var laRef = citiesRef.doc('LA');
        //        var tokRef = citiesRef.doc('TOK');
        //        var bjRef = citiesRef.doc('BJ');
        //        var dcRef = citiesRef.doc('DC');
        //        var sfRef = citiesRef.doc('SF');
        //        var message = this.database.collection('messages').doc('OTHER')
        //        this.database.runTransaction(transaction => {
        //
        //            return transaction.get(laRef)
        //                    .then(doc => {
        //
        //                        let newPopulation = doc.data().population + 1;
        //                        transaction.update(laRef, {population: newPopulation});
        //                        return newPopulation
        //                    })
        //        })
        //                .then(result => console.log(result)) // 
        //                .catch(error => console.log(error))

        /* 
        multipel document and other colleciton
        複数ドキュメント
        別のコレクションを含めることもできる
        */

        //        this.database.runTransaction(transaction => {
        //
        //            return transaction.get(laRef)
        //                    .then(doc => {
        //                        let time = firebase.firestore.FieldValue.serverTimestamp();
        //
        //                        // トランザクションにはドキュメント参照渡せる！
        //                        transaction.update(laRef, {status: 'new', created: time});
        //                        transaction.update(tokRef, {status: 'new', created: time});
        //                        transaction.update(bjRef, {status: 'new', created: time});
        //                        transaction.update(dcRef, {status: 'new', created: time});
        //                        // 違うコレクションでも可能
        //                        transaction.set(message, {name: 'kohei', status: 'from transaction', created: time});
        //                    });
        //        })
        //                .then(result => console.log(result))
        //                .catch(error => console.log(error))

        /*
        batch
        バッチ処理
        ------------------------------------------------------------------------------
         */
        //        // Get a new write batch
        //        var batch = db.batch();
        //
        //        // Set the value of 'NYC'
        //        var nycRef = citiesRef.doc("NYC");
        //        batch.set(nycRef, {name: "New York City"});
        //
        //
        //        // Update the population of 'SF'
        //        var sfRef = citiesRef.doc("SF");
        //        batch.update(sfRef, {"population": 1000000});
        //
        //        // Delete the city 'LA'
        //        var laRef = citiesRef.doc("LA");
        //        batch.delete(laRef);
        //
        //        // Commit the batch
        //        batch.commit().then(() => {
        //            console.log('batch done!');
        //        })

        /*
        get
        ドキュメントの取得
        ------------------------------------------------------------------------------
         */

        /* 
        get document list
        コレクションのドキュメントリストを取得
        */

        //        citiesRef.get()
        //                .then(docs => {
        ////                    console.log(docs);
        //                    console.log(docs.size);
        //                    console.log(docs.empty);
        ////                    console.log(docs.docChanges);
        ////                    console.log(docs.docs);
        ////                    console.log(docs.metadata);
        //                    docs.forEach((doc, key) => {
        //
        //                        console.log('-------------------');
        ////                        console.log(doc);
        //                        console.log(doc.id);
        //                        console.log(doc.exists);
        //                        console.log(doc.data());
        //                        console.log(doc);
        //                        console.log(doc.ref);
        ////                        console.log(doc.metadata);
        //                    })
        //                })

        /* 
        get document
        ドキュメントを取得
        */
        //        citiesRef.doc('LA').get()
        //                .then(doc => {
        //                    console.log(doc);
        //                    console.log(doc.id);
        //                    console.log(doc.data());
        //                    console.log(doc.exists);
        //                })

        /* 
        query where
        クエリの仕様
        */

        // 範囲比較演算(<, <=, >, >=)は複数フィールドに対して実行することはできない
        //        citiesRef
        //                .where('capital', '==', true)
        ////                .where('state', '==', 'CA')
        ////                .where('population', '<=', 3900000)
        ////                .where('population', '>=', 680000)
        //                .where('created', '>=', new Date('2018-5-9 12:00:00'))
        //                .get()
        //                .then(docs => {
        //                    docs.forEach(function (doc) {
        //                        console.log(doc.id, ":", doc.data());
        //                    });
        //                })
        //                .catch(error => console.log(error))

        /* 
        get sub collection
        サブコレクションのドキュメントリストを取得
        */

        //        citiesRef.doc('LA').collection('animal').get()
        //                .then(docs => {
        //                    docs.forEach(doc => console.log(doc.data()))
        //                })

        /* 
        limit and order
        リミットとオーダー
        */

        //        citiesRef.orderBy("name").limit(3).get()
        //                .then(docs => {
        //                    docs.forEach(doc => {
        //                        console.log(doc.id, ":", doc.data());
        //                    });
        //                })
        //                .catch(error => console.log(error))

        /* 
        limit and order 2times and desc
        リミットとオーダーを２つ、１つを降順
        */
        //        citiesRef.orderBy("state").orderBy('population', 'desc').limit(3).get()
        //                .then(docs => {
        //                    docs.forEach(doc => {
        //                        console.log(doc.id, ":", doc.data());
        //                    });
        //                })
        //                .catch(error => console.log(error))

        /* 
        limit and order and where
        リミットとクエリ
        */

        //        // 不等式を使用している場合は、orderByによる並び替えは
        //        // 不等式演算を行った対象の要素に対して実施
        //        citiesRef
        //                .where("population", ">", 100000)
        //                .orderBy('population', 'desc')
        //                .limit(1)
        //                .get()
        //                .then(docs => {
        //                    docs.forEach(doc => {
        //                        console.log(doc.id, ":", doc.data());
        //                    });
        //                })
        //                .catch(error => console.log(error))

        /* 
        use query cursor
        クエリカーソルの利用
        */

        // startAt()とendAt()は境界値を含む条件(<=, >=)
        // startAfter()とendBefore()は境界値を含まない条件(<, >)

        //        citiesRef.orderBy("population").startAt(9000000).get()
        //                .then(docs => {
        //                    docs.forEach(doc => {
        //                        console.log(doc.id, ":", doc.data());
        //                    });
        //                })
        //                .catch(error => console.log(error))

        //        citiesRef.orderBy("population").endBefore(9000000).get()
        //                .then(docs => {
        //                    docs.forEach(doc => {
        //                        console.log(doc.id, ":", doc.data());
        //                    });
        //                })
        //                .catch(error => console.log(error))

        /* 
        use query cursor
        複数のカーソル条件の設定
        */

        // citiesRef
        // .orderBy("category1")
        // .orderBy("category2") // orderByで追加できる
        //     .startAt('aaa', '222')
        //     .endBefore('bbb')
        //     .get()
        //     .then(docs => {
        //         docs.forEach(doc => {
        //             console.log(doc.id, ":", doc.data());
        //         });
        //     })

        /* 
        query user document snapshot
        スナップショットを仕様
        */

        //        citiesRef.doc('SF').get()
        //                .then(doc => {
        //
        //                    // Get all cities with a population bigger than San Francisco
        //                    //orderBy("population")を指定するとstartAt()の条件もpopulationに自動的に制限される
        //                    var biggerThanSf = citiesRef
        //                            .orderBy("population")
        //                            .startAt(doc)
        //                    
        //                    // これでもOK
        ////                    let sfDoc = doc.data();
        ////                    var biggerThanSf = citiesRef
        ////                            .orderBy("population")
        ////                            .startAt(sfDoc.population)
        //
        //                    biggerThanSf.get().then(docs => {
        //                        docs.forEach(doc => {
        //                            console.log(doc.id, ":", doc.data());
        //                        });
        //                    });
        //                })
        //                .catch(error => console.log(error))

        /*
         * paginate
         */

        //        var first = citiesRef.orderBy('population').limit(2)
        //
        //        first.get().then(docs => {
        //            console.log('page1');
        //            docs.forEach(doc => {
        //                console.log(doc.id, ":", doc.data());
        //            });
        //        });
        //
        //        first.get().then(docs => {
        //            // Get the last visible document
        //            var lastVisible = docs.docs[docs.size - 1];
        //
        //            // Construct a new query starting at this document,
        //            // get the next 2 cities.
        //            var next = citiesRef
        //                    .orderBy("population")
        //                    .startAfter(lastVisible)
        //                    .limit(2);
        //
        //            next.get().then(docs => {
        //                console.log('page2');
        //                docs.forEach(doc => {
        //                    console.log(doc.id, ":", doc.data());
        //                });
        //            });
        //        })

        /* 
        paginate good
        */

        // let query = citiesRef.orderBy('created')
        // const pagenate = new Pagenate(query).setItemPerPage(2)

        // this.selector('#get').addEventListener('click', event => {
        //     pagenate.getPageItems()
        //         .then(docs => {
        //             docs.forEach(doc => {
        //                 console.log(doc.id)
        //             })
        //         })
        //         .catch(error => {
        //             console.log('done!');
        //         })
        // })

        // this.selector('#reset').addEventListener('click', event => {
        //     pagenate.reset();
        // })

        /* 
        event
        */

        /* 
        単一ドキュメント変更のリッスン
        */

        // citiesRef.doc("NYC")
        //     .onSnapshot(doc => {
        //         console.log(doc);
        //         console.log("Current data: ", doc && doc.data());
        //     });

        /*
        リッスンをメタデータでローカルとサーバを振り分け
        コールバックはローカルとサーバ両方ではっせいするので二度返ってくる
        */

        // citiesRef.doc('SF')
        //     .onSnapshot(function (doc) {
        //         var source = doc.metadata.hasPendingWrites ? "Local" : "Server";
        //         console.log(source, " data: ", doc && doc.data());
        //     });

        /* 
        コレクションをリッスン
        */

        // citiesRef.onSnapshot(docs => {
        //     var source = docs.metadata.hasPendingWrites ? "Local" : "Server";
        //     console.log('Cities ', source);

        //     docs.forEach(doc => {
        //         var source = doc.metadata.hasPendingWrites ? "Local" : "Server";
        //         console.log(doc.id, source);
        //     })
        // });

        /* 
        コレクションの各ドキュメントの変更タイプ取得
        */

        // citiesRef.onSnapshot(docs => {            
        //     docs.docChanges.forEach(change => {
        //         if (change.type === "added") {
        //             console.log("New city: ", change.doc.data());
        //         }
        //         if (change.type === "modified") {
        //             console.log("Modified city: ", change.doc.data());
        //         }
        //         if (change.type === "removed") {
        //             console.log("Removed city: ", change.doc.data());
        //         }
        //     })
        // });

        /* 
        whereをつかてってリッスン
        */

        // citiesRef.where("state", "==", "CA")
        // .onSnapshot(querySnapshot => {
        //     var cities = [];
        //     querySnapshot.forEach(function (doc) {
        //         cities.push(doc.data().name);
        //     });
        // });

        /* 
        change at local チェック用
        */
        // this.selector('#set').addEventListener('click', event => {
        //     citiesRef.doc('SF').get().then(doc => {
        //         let capital = !doc.data().capital
        //         doc.ref.update({
        //             capital: capital
        //         })
        //     })
        // })


        /* 
        documentリファレンスを保存
        */

        // citiesRef.doc('LA').update({
        //     people: this.database.collection('people').doc('T0N4vooiKHA5XdL7RQPM')
        // })
        //     .then(result => console.log(result)) // document refalence
        //     .catch(error => console.log(error))

        /* 
        documentリファレンスを取得
        */

        // citiesRef.doc('LA').get()
        //     .then(doc => {
        //         const people = doc.data().people
        //         people.get().then(pl => console.log(pl.data()))
        //     })
        //     .catch(error => console.log(error))


        /* 
        コレクションを取得して各ドキュメントのリファレンスを保存
        */
        // this.database.collection('people').get()
        //     .then(docs => {
        //         let people = []
        //         docs.forEach(doc => {
        //             people.push(doc.ref)
        //         })
        //         console.log(people)
        //         citiesRef.doc('LA').update({
        //             people: people
        //         })
        //     })
        //     .catch(error => console.log(error))

        /* 
        保存した複数のリファレンスを取得
        */
        // citiesRef.doc('LA').get()
        //     .then(doc => {
        //         const peopleRefs = doc.data().people
        //         peopleRefs.forEach(peopleRef => {
        //             peopleRef.get().then(people => console.log(people.data()))
        //         });
        //     })
        //     .catch(error => console.log(error))

    }
}