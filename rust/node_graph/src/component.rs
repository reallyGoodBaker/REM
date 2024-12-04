use std::{collections::HashMap, time::Instant};

use wasm_bindgen::JsValue;
use web_sys::{js_sys::Function, window};

pub trait Component {
    fn on_update(&mut self, delta_time: f64);
}

pub struct ComponentManager {
    time_stamp: f64,
    components: HashMap<String, Box<dyn Component>>,
}

impl ComponentManager {
    pub fn new() -> Self {
        Self {
            time_stamp: window().unwrap().performance().unwrap().now() as f64,
            components: HashMap::new(),
        }
    }

    fn tick_time(&mut self) -> f64 {
        let now = window().unwrap().performance().unwrap().now();
        let delta_time = now - self.time_stamp;
        self.time_stamp = now;
        delta_time
    }

    pub fn tick(&mut self) {
        let delta_time = self.tick_time();
        for (_, component) in self.components.iter_mut() {
            component.on_update(delta_time);
        }
    }

    pub fn add_component(&mut self, id: String, component: impl Component + 'static) {
        self.remove_component(&id);
        self.components.insert(id, Box::new(component));
    }

    pub fn remove_component(&mut self, id: &str) {
        if let Some((_, _)) = self.components.iter().find(|(i, _)| *i == &id) {
            self.components.remove(id);
        }
    }

    pub fn get_component(&self, id: &str) -> Option<&Box<dyn Component>> {
        match self.components.iter().find(|(i, _)| *i == &id) {
            Some((_, component)) => Some(component),
            None => None,
        }
    }

    pub fn get_component_mut<T: Component>(&mut self, id: String) -> Option<&mut Box<dyn Component>> {
        match self.components.iter_mut().find(|(i, _)| *i == &id) {
            Some((_, component)) => Some(component),
            None => None,
        }
    }
}

pub struct CompJs {
    func: Function,
}

impl CompJs {
    pub fn new(func: Function) -> Self {
        Self {
            func,
        }
    }
}

impl Component for CompJs {
    fn on_update(&mut self, delta_time: f64) {
        let this = JsValue::null();
        self.func.call1(&this, &JsValue::from(delta_time)).unwrap();
    }
}

pub fn from_js(func: Function) -> impl Component {
    CompJs::new(func)
}