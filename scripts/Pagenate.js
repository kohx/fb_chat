import { Parent } from './Parent.js'

export class Pagenate extends Parent {

    constructor(ref, itemParPage = 10) {
        super()
        this.itemParPage = itemParPage
        this.lastVisible = null
        this.ref = ref
    }

    setItemPerPage(itemParPage) {
        this.itemParPage = itemParPage
        return this
    }

    reset(){
        this.lastVisible = null
    }

    async getPageItems() {
        let result
        let present = this.ref
        if (this.ref !== null) {
            present = this.ref.startAfter(this.lastVisible)
        }
        await present.limit(this.itemParPage).get()
            .then(docs => {
                const size = docs.size
                if (docs.empty) {
                    return
                }
                this.lastVisible = docs.docs[size - 1]
                result = docs
            });
        return result
    }
}