import { h, Component } from 'preact';
import Tools from '../../tools.jsx'
const RippleWrapper = (ComponentToWrap) => {
    return class RippleWrapper extends Component {
        constructor() {
            super()
            this.state.ripple = {}
        }
        async handlePointer(event) {
            const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms))
            //Check if the left mouse button (not right)
            if (event.buttons !== 1) {
                event.preventDefault()
                return
            }
            //Grab the element thats being clicked on (like a button for example)
            let elem = event.currentTarget
            //Lets set the capture target to that element. Its a DOM element by the way
            event.currentTarget.setPointerCapture(event.pointerId)
            //Event to check if the pointer event has been lost
            let whenLostPointerCapture = new Promise((r) => event.currentTarget.addEventListener("lostpointercapture", r, { once: true }));
            //Grab the bound area of the element    
            var rect = elem.getBoundingClientRect();
            //Make a local state of all ripples in usage
            let ripple = this.state.ripple
            //Create a new ID for this RIPPLE
            let uuid = ([1e7] + -1e3 + -4e3 + -8e3 + -1e11).replace(/[018]/g, c =>
                (c ^ crypto.getRandomValues(new Uint8Array(1))[0] & 15 >> c / 4).toString(16)
            )
            //Create a local object of the ripple to be referenced to
            let object
            //Calculate the math needed for positioning the ripple
            let data = { xPos: (event.pageX - rect.left), yPos: (event.pageY - rect.top) }
            ripple[uuid] = (<div ref={c => object = c} key={uuid} class="crust--ripple ripple" style={{ top: (data.yPos - (100 / 2)), left: (data.xPos - (100 / 2)) }}></div>)
            //Update this ripple and all ripples in the component, for rendering
            this.setState({ ripple: ripple, lastRipple: uuid })
            //Wait a little for the ripple to trigger
            await sleep(150)
            //Add the transitionComplete event after the sleep (because the reference wouldn't work instantly)
            let transitionComplete = new Promise((r) => object.addEventListener("animationend", r, { once: true }));
            //Now check first to see if the pointer has been release
            await whenLostPointerCapture
            //Then check to see if the transition is done, if so clean up
            await transitionComplete
            //Remove ripple from ripples list (state)
            delete ripple[uuid]
            this.setState({ ripple: ripple })
        }
        renderRipple() {
            let ripples = []
            for (let ripple in this.state.ripple) {
                let data = this.state.ripple[ripple]
                ripples.push(data)
            }
            return ripples
        }
        render(props, state) {
            return (
                <ComponentToWrap {...props} onPointerDown={this.handlePointer.bind(this)}>{props.children}{this.renderRipple()}</ComponentToWrap>
            )
        }
    }
}
export default RippleWrapper