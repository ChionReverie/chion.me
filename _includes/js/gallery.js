class CarouselHandle { 
    /**
     * @param {Element} target 
     */
    constructor(target) {
        /** @type {Element} */
        this.target = target
    }

    /**
     * @param {Element} target
     */
    static fromElement(target) {
        const isCarousel = target.matches("[data-type='carousel']")
        if(!isCarousel) {
            console.error("Not a carousel element")
            return null
        }

        const carousel = new CarouselHandle(target)
        if(!carousel.id) {
            console.error("Carousel element is missing id")
            return null
        }
        return carousel
    }

    /**
     * @param {string} id
     * @returns {CarouselHandle?}
     */
    static fromId(id) {
        const target = document.querySelector(`[data-type='carousel'][data-id='${id}']`)
        if(!target) {
            return null
        }
        return new CarouselHandle(target)
    }
    
    get id() {
        return this.target.getAttribute("data-id")
    }

    get slider() {
        return this.target.querySelector('.carousel-slider')
    }

    get sourceGallery() {
        const id = this.target.getAttribute("data-source-gallery")
        return GalleryHandle.fromId(id)
    }

    get selectedId() {
        return this.target.getAttribute('data-selected-id')
    }
    get selected() {
        const source = this.target.querySelector(`[data-type='carousel-entry'][data-id='${this.selectedId}']`)
        return CarouselEntry.fromElement(source)
    }

    /**
     * @returns {CarouselEntry[]}
     */
    get listActive() {
        const arr = Array.from(this.target.querySelectorAll('[data-selected]'))
        return arr.map((element) => {
            return CarouselEntry.fromElement(element)
        })
    }

    /** @private */
    set selectedId(id) {
        return this.target.setAttribute('data-selected-id', id)
    }

    /**
     * @param {string|GalleryHandle} gallery
     * @param {string?} entry_id 
     */
    populateFromGallery(gallery, entry_id) {
        if (typeof gallery == "string") {
            gallery = GalleryHandle.fromId(gallery)
        }

        let initialSource;
        if(entry_id)
            initialSource = gallery.entryWithId(entry_id)
        else
            initialSource = gallery.defaultEntry()

        const entry = CarouselEntry.createFromGalleryEntry(initialSource)

        // Prepare container
        const container = this.target.querySelector('.dialog-container')
        container.innerHTML = ""

        const header = document.createElement('h1')
        header.innerText = gallery.title
        const wrapper = document.createElement('div')
        wrapper.classList.add('carousel-slider')
        container.append(header, wrapper)
        
        // View
        this.replaceView(entry)
    }
    
    /**
     * @param {CarouselEntry} entry 
     */
    replaceView(entry) {
        const slider = this.slider
        slider.innerHTML = ""

        this.selectedId = entry.id

        slider.append(entry.target)
    }

    toNext() {
        const list = this.sourceGallery.list
        const old = this.selected;
        const selected_id = old.id
        let index = list.findIndex((entry) => {
            return entry.id == selected_id
        })
        index += 1
        if(index >= list.length) {
            index = 0
        }

        const next_source = list[index]
        const next = CarouselEntry.createFromGalleryEntry(next_source)

        // Remove old
        old.target.classList.add('anim-vanishLeft')
        old.target.addEventListener('animationend', () => {
            old.target.remove()
        })
        old.target.removeAttribute('data-index')
        
        // Insert new
        this.selectedId = next.id
        next.target.classList.add('anim-spawnRight')
        this.slider.append(next.target)
    }

    toPrevious() {
        const list = this.sourceGallery.list
        const old = this.selected;
        const selected_id = old.id
        let index = list.findIndex((entry) => {
            return entry.id == selected_id
        })
        index -= 1
        if(index < 0) {
            index = list.length - 1
        }

        const next_source = list[index]
        const next = CarouselEntry.createFromGalleryEntry(next_source)

        // Remove old
        old.target.classList.add('anim-vanishRight')
        old.target.addEventListener('animationend', () => {
            old.target.remove()
        })
        old.target.removeAttribute('data-index')
        
        // Insert new
        this.selectedId = next.id
        next.target.classList.add('anim-spawnLeft')
        this.slider.append(next.target)
    }
}

class GalleryHandle {
    /**
     * @private
     * @param {string} id 
     * @param {Element} target
     */
    constructor(target, id) {
        this.id = id
        this.target = target
    }

    /**
     * @param {Element} target
     * @returns {GalleryHandle?}
     */
    static fromElement(target) {
        const isGallery = target.matches("[data-type='gallery']")
        if(!isGallery) {
            console.error("Not a gallery element")
            return null
        }
        
        const id = target.getAttribute("data-id")
        if(!id) {
            console.error("Gallery element is missing id")
            return null
        }

        return new GalleryHandle(target, id)
    }

    /**
     * @param {string} id
     * @returns {GalleryHandle?}
     */
    static fromId(id) {
        const target = document.querySelector(`[data-type='gallery'][data-id='${id}']`)
        if(!target) {
            return null
        }
        return new GalleryHandle(target, id)
    }

    /**
     * @param {string} entry_id 
     */
    openDialog() {
        // XXX: I should consider separating dialog and carousel logic
        const carousel = CarouselHandle.fromId(this.carouselId)
        carousel.target.showModal()
    }

    /**
     * @param {string} entry_id
     * @returns {GalleryEntry} 
     */
    entryWithId(entry_id) {
        const entry = this.target.querySelector(`[data-type='gallery-entry'][data-id='${entry_id}']`)
        if(!entry) {
            return null
        }

        return GalleryEntry.fromElement(entry)
    }
    /**
     * @returns {GalleryEntry}
     */
    defaultEntry() {
        const list = Array.from(this.target.querySelectorAll("[data-type='gallery-entry']"))
        const first = list.at(0)
        if(!first) {
            return null
        }

        return first
    }

    get list() {
        const elements = Array.from(this.target.querySelectorAll("[data-type='gallery-entry']"))
        return elements.map((element) => {
            return GalleryEntry.fromElement(element)
        })
    }

    get carouselId() {
        return this.target.getAttribute("data-carousel-id")
    }

    get title() {
        return this.target.getAttribute("data-title")
    }
}

class GalleryEntry {
    /**
     * @private
     * @param {Element} target
     */
    constructor(target) {
        this.target = target
    }

    /**
     * @param {Element} target 
     * @returns {GalleryEntry}
     */
    static fromElement(target) {
        const isGalleryEntry = target.matches("[data-type='gallery-entry']")
        if(!isGalleryEntry) {
            console.error("Not a gallery entry")
            return null
        }

        const entry = new GalleryEntry(target)
        if(!entry.id) {
            console.error("Gallery entry is missing id")
            return null
        }
        return entry
    }

    /**
     * @returns {string} 
     */
    get id() {
        return this.target.getAttribute("data-id")
    }

    get altText() {
        return this.target.getAttribute("data-alt-text")
    }

    get title() {
        return this.target.getAttribute("data-title")
    }
    
    get imageSrc() {
        return this.target.getAttribute("data-image-src")
    }
    get thumbnailSrc() {
        return this.target.getAttribute("data-thumbnail-src")
    }
}

class CarouselEntry {
    /**
     * @param {Element} target 
     */
    constructor(target) {
        /** @type {Element} */
        this.target = target
    }

    /**
     * @param {GalleryEntry} source 
     * @returns {CarouselEntry}
     */
    static createFromGalleryEntry(source) {
        const target = document.createElement('figure')
        target.setAttribute('data-id', source.id)
        target.setAttribute('data-selected', true)
        target.setAttribute('data-type', 'carousel-entry')

        const header = document.createElement('h2')
        header.innerText = source.title
        const image = document.createElement('img')
        image.src = source.imageSrc
        image.altText = source.altText
        const caption = document.createElement('figcaption')
        caption.innerText = source.altText

        target.append(header, image, caption)

        return new CarouselEntry(target)
    }

    /**
     * @param {Element} target 
     * @returns {CarouselEntry}
     */
    static fromElement(target) {
        return new CarouselEntry(target)
    }

    get id() {
        return this.target.getAttribute("data-id")
    }
}

/** @deprecated */
const gallery = {}

/**
 * @param {Event} event 
 */
let gallery_ready = function(event) {
    const open_buttons = document.querySelectorAll("[data-effect='open-carousel']")
    open_buttons.forEach((button) => {
        button.addEventListener("click", (event) => {
            /** @type {Element} */
            const entry = event.currentTarget
            const entry_id = entry.getAttribute("data-id")
            const gallery_target = entry.closest("[data-type='gallery']")

            let gallery = GalleryHandle.fromElement(gallery_target)
            let carousel = CarouselHandle.fromId(gallery.carouselId)
            carousel.populateFromGallery(gallery, entry_id)
            gallery.openDialog(entry_id)
        })
    })

    const closeButtons = document.querySelectorAll("[data-effect='close-dialog']")
    closeButtons.forEach((button) => {
        button.addEventListener("click", (event) => {
            /** @type {Element} */
            const target = event.currentTarget
            target.closest('dialog').close()
        })
    })

    const dialogs = document.querySelectorAll("dialog")
    dialogs.forEach((dialog) => {
        dialog.addEventListener("click", (event) => {
            /** @type {Element} */
            const target = event.currentTarget
            const rect = target.getBoundingClientRect()
            const isOutsideDialog =
                event.clientY < rect.top || 
                event.clientY > rect.bottom || 
                event.clientX < rect.left || 
                event.clientX > rect.right
            if(!isOutsideDialog) 
                return
            target.close()
        })
    })

    const nextButtons = document.querySelectorAll("[data-effect='carousel-next']")
    nextButtons.forEach((button) => {
        button.addEventListener("click", (event) => {
            const target = event.target.closest("[data-type='carousel']")
            CarouselHandle.fromElement(target).toNext()
        })
    })

    const prevButtons = document.querySelectorAll("[data-effect='carousel-previous']")
    prevButtons.forEach((button) => {
        button.addEventListener("click", (event) => {
            const target = event.target.closest("[data-type='carousel']")
            CarouselHandle.fromElement(target).toPrevious()
        })
    })
}

document.addEventListener("DOMContentLoaded", gallery_ready) 