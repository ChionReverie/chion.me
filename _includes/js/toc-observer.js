const TOC_Observer = {};

/**
 * @param {Event} event 
 */
TOC_Observer.ready = function(event) {
    // TODO: The selected elements should be determined by data attributes.

    const scrollspyList = document.querySelectorAll("[data-type='scrollspy']")
    scrollspyList.forEach((nav) => {
        const target_id = nav.getAttribute("data-scrollspy-target")
        const link_selector = nav.getAttribute("data-scrollspy-link-selector")
        
        const targetArea = document.querySelector(`[data-scrollspy-id="${target_id}"]`)

        if(!targetArea) {
            console.error("Missing content scroll", target_id)
            return
        }
        
        const options = {
            root: targetArea,
            rootMargin: "-40% 0px -40% 0px",
            scrollMargin: "0px",
            threshold: 0,
        }
        const observer = new IntersectionObserver(TOC_Observer.callback, options)

        const links = nav.querySelectorAll(link_selector)
        
        links.forEach((entry) => {
            const href = entry.getAttribute("href")
            if(href == null)
                return
            // We want to make sure we only target elements with a valid ID
            // IE not a URL
            const match = /^\#[\w\-\_\d]+$/.exec(href);
            if(match == null) {
                return
            }

            const target = targetArea.querySelector(href)
            if(target == null) {
                console.error("Table of contents references an ID that doesn't exist.")
                return
            }
            observer.observe(target)
        })
    })
}

/**
 * @param {IntersectionObserverEntry[]} entries 
 * @param {InteractionObserver} observer
 */
TOC_Observer.callback = function(entries, observer) {
    const toc = document.querySelector("#toc")
    const links = toc.querySelectorAll(".toc-entry a")

    
    entries.forEach((entry) => {
        const target_id = entry.target.getAttribute("id")

        if(!entry.isIntersecting) {
            return
        }

        links.forEach((link) => {
            const link_href = link.getAttribute("href")
            if(link_href == `#${target_id}`) {
                link.classList.add("active")
                return
            }
            link.classList.remove("active")
        })
    });
}

document.addEventListener("DOMContentLoaded", TOC_Observer.ready) 