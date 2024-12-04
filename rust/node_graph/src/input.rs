use std::{collections::HashSet, sync::{Arc, Mutex}};
use wasm_bindgen::{prelude::{wasm_bindgen, Closure}, JsCast, JsValue};
use web_sys::{js_sys::Function, KeyboardEvent, MouseEvent, WheelEvent, Window};

#[wasm_bindgen]
pub struct InputManager {
    mouse_pos: Arc<Mutex<[i32; 2]>>,
    mouse_wheel_delta: Arc<Mutex<[f64; 2]>>,
    mouse_buttons: Arc<Mutex<u16>>,
    keys_pressing: HashSet<&'static str>,
}

pub enum MouseButton {
    Left = 1,
    Middle = 4,
    Right = 2,
    Mouse3 = 8,
    Mouse4 = 16,
}

impl InputManager {
    pub fn new(window: &Window) -> Arc<Self> {
        let product = Arc::new(
            Self {
                mouse_pos: Arc::new(Mutex::new([0, 0])),
                mouse_wheel_delta: Arc::new(Mutex::new([0., 0.])),
                keys_pressing: HashSet::new(),
                mouse_buttons: Arc::new(Mutex::new(0)),
            }
        );

        product.clone()
            ._listen_to_events(window)
            .expect("Failed to listen to events");

        product
    }

    fn _listen_to_events(self: Arc<Self>, window: &Window) -> Result<(), JsValue> {
        let mousemove = Closure::wrap(Box::new({
            let arc_self = self.clone();

            move |event: MouseEvent| {
                let mut mouse_pos = arc_self.mouse_pos.lock().unwrap();
    
                if let Some(x) = mouse_pos.get_mut(0) {
                    *x = event.screen_x();
                }
    
                if let Some(y) = mouse_pos.get_mut(1) {
                    *y = event.screen_y();
                }
    
            }
        }) as Box<dyn FnMut(MouseEvent) + 'static>);


        let wheel = Closure::wrap(Box::new({
            let arc_self = self.clone();

            move |event: WheelEvent| {
                let mut mouse_wheel_delta = arc_self.mouse_wheel_delta.lock().unwrap();
    
                if let Some(delta_x) = mouse_wheel_delta.get_mut(0) {
                    *delta_x = event.delta_x();
                }
    
                if let Some(delta_y) = mouse_wheel_delta.get_mut(1) {
                    *delta_y = event.delta_y();
                }
    
            }
        }) as Box<dyn FnMut(WheelEvent) + 'static>);


        let keychange = Closure::wrap(Box::new({
            let arc_self = self.clone();

            move |event: KeyboardEvent| {
                let mut keys_pressing = arc_self.keys_pressing.clone();
    
                keys_pressing.insert(event.code().as_str());
            }
        }) as Box<dyn FnMut(KeyboardEvent) + 'static>);
        let keychange_js = keychange.as_ref().unchecked_ref::<Function>();


        let mousebutton = Closure::wrap(Box::new({
            let arc_self = self.clone();

            move |event: MouseEvent| {
                let mut mouse_buttons = arc_self.mouse_buttons.lock().unwrap();
    
                *mouse_buttons = event.buttons();
            }
        }) as Box<dyn FnMut(MouseEvent) + 'static>);
        let mousebutton_js = mousebutton.as_ref().unchecked_ref::<Function>();
    
        window.add_event_listener_with_callback("mousemove", mousemove.as_ref().unchecked_ref())?;
        window.add_event_listener_with_callback("wheel", wheel.as_ref().unchecked_ref())?;
        window.add_event_listener_with_callback("keydown", keychange_js)?;
        window.add_event_listener_with_callback("keyup", keychange_js)?;
        window.add_event_listener_with_callback("mousedown", mousebutton_js)?;
        window.add_event_listener_with_callback("mouseup", mousebutton_js)?;

        mousemove.forget();
        wheel.forget();
        keychange.forget();
        mousebutton.forget();

        Ok(())
    }

    pub fn mouse_pos(&self) -> (i32, i32) {
        (
            self.mouse_pos.lock().unwrap()[0] as i32,
            self.mouse_pos.lock().unwrap()[1] as i32
        )
    }

    pub fn mouse_wheel_delta(&self) -> (f64, f64) {
        (
            self.mouse_wheel_delta.lock().unwrap()[0],
            self.mouse_wheel_delta.lock().unwrap()[1]
        )
    }

    pub fn is_key_pressed(&self, key: &'static str) -> bool {
        self.keys_pressing.contains(key)
    }

    pub fn mouse_buttons(&self) -> u16 {
        *self.mouse_buttons.lock().unwrap()
    }

    pub fn clear_mouse_wheel_delta(&self) {
        let mut mouse_wheel_delta = self.mouse_wheel_delta.lock().unwrap();
        mouse_wheel_delta[0] = 0.;
        mouse_wheel_delta[1] = 0.;
    }

    pub fn is_mouse_button_pressed(&self, button: MouseButton) -> bool {
        self.mouse_buttons() & button as u16 != 0
    }

}