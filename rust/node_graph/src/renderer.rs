use wasm_bindgen::prelude::wasm_bindgen;
use web_sys::{window, CanvasRenderingContext2d, Performance};
use std::sync::Arc;

use crate::input::*;
use crate::component::ComponentManager;

#[wasm_bindgen]
pub struct GraphRenderer {
    input_manager: Arc<InputManager>,
    manager: ComponentManager,
    ctx: CanvasRenderingContext2d,
}

impl GraphRenderer {
    pub fn new(
        ctx: CanvasRenderingContext2d,
    ) -> Self {
        Self {
            input_manager: InputManager::new(&window().unwrap()),
            manager: ComponentManager::new(),
            ctx,
        }
    }

    pub fn ctx(&self) -> &CanvasRenderingContext2d {
        &self.ctx
    }

    pub fn update_once(&mut self) {
        self.manager.tick();
    }

    pub fn input_manager(&mut self) -> Arc<InputManager> {
        self.input_manager.clone()
    }

}