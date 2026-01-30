class ScrollSpy {    
    /**
     * @private
     * @param {Element} scrollpane 
     */
    constructor(scrollpane) {
        /** @type {Element} */
        this.scrollpane = scrollpane
        /** @type { {link: Element, heading: Element}[] } */
        this.watched = []
    }

    /**
     * @param {Element} navpane 
     */
    static forNavPane(navpane) {
        const scrollpaneId = navpane.getAttribute("data-scrollspy-scrollpane")
        
        const linkSelector = navpane.getAttribute('data-scrollspy-link-selector')
        if(!linkSelector) {
            console.error("Scrollspy element missing link selector attribute", navpane)
            return null
        }

        const scrollpane = document.querySelector(`[data-scrollspy-id="${scrollpaneId}"]`)
        if(!scrollpane) {
            console.log("Scrollpane not found with id", scrollpaneId)
            return null
        }

        const scrollspy = new ScrollSpy(scrollpane)

        const links = navpane.querySelectorAll(linkSelector)
        links.forEach((link) => {
            scrollspy.observeForLink(link)
        })

        // TODO: Should I be able to call onScroll without borrowing from parent scopes?
        scrollpane.addEventListener('scroll', (event) => {
            scrollspy.onScroll()
        })

        return scrollspy
    }

    observeForLink(link) {
        const id = link.getAttribute('href')
        if(!id) {
            return
        }
        const heading = this.scrollpane.querySelector(id)
        if(!heading) {
            console.error("Missing header for selector", id)
            return
        }

        const data = {link, heading}
        this.watched.push(data)
    }

    onScroll() {
        const scroll = this.scrollpane.scrollTop
        const scroll_height = this.scrollpane.scrollHeight - this.scrollpane.clientHeight
        const scroll_progress = (scroll / scroll_height)

        const eyeline_y = this.scrollpane.clientHeight * scroll_progress

        let lastSeen = this.watched.at(0)

        // Find last-seen element for scroll
        for (const entry of this.watched) {
            const top = entry.heading.getBoundingClientRect().top
            if(top > eyeline_y) {
                break;
            }
            lastSeen = entry
        }

        // Active
        this.watched.forEach((entry) => {
            if(entry == lastSeen) {
                entry.link.classList.add("active")
                return
            }
            entry.link.classList.remove("active")
        })
    }
}

document.addEventListener("DOMContentLoaded", function(event) {
    const scrollspyList = document.querySelectorAll("[data-type='scrollspy']")

    scrollspyList.forEach((nav) => {
        nav.scrollSpy = ScrollSpy.forNavPane(nav)
    })
})
