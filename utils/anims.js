export function anim(dom, keyframes, options) {
    return new Promise((resolve, reject) => {
        let animation = dom.animate(keyframes, options);
        animation.onfinish = () => resolve(animation);
        animation.onremove = () => reject(animation);
    })
}   

export function pageSwipe(pageOld, pageNew, container, callback) {
    pageNew.style.opacity = 0;
    container.appendChild(pageNew);

    pageOld.animate([
        {
            position: 'absolute',
            top: '0px',
            left: '0px',
            opacity: 1
        },
        {
            transform: 'scale(1.1)',
            opacity: 0
        }

    ], {
        fill: 'forwards',
        duration: 300
    }).onfinish = () => {
        pageOld.remove();
    };

    setTimeout(() => {
        pageNew.animate([
            {
                opacity: 0,
                transform: 'scale(0.9)',
            },
            {
                transform: 'scale(1)',
                opacity: 1
            }
    
        ], {
            fill: 'forwards',
            duration: 300
        }).onfinish = () => {
            callback.call(pageNew, pageNew)
        };
    }, 100);

}