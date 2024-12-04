mod input;
mod renderer;
mod component;

use std::sync::Arc;

use wasm_bindgen::{prelude::Closure, JsCast};
use js_sys::Function;
use wasm_bindgen::{prelude::wasm_bindgen, JsValue};
use web_sys::*;


use input::InputManager;

#[wasm_bindgen]
pub fn run(width: f32, height: f32, fun: Function) -> Result<(), JsValue> {
    let (
        canvas,
        ctx,
    ) = setup_canvas(width, height)?;
    let graph_renderer = renderer::GraphRenderer::new(ctx);

    fun.call2(&JsValue::undefined(), &canvas, &graph_renderer.ctx())?;


    Ok(())
}

fn setup_canvas(width: f32, height: f32) -> Result<(HtmlCanvasElement, CanvasRenderingContext2d), JsValue> {
    let window = window().unwrap();
    let document = window.document().unwrap();
    let canvas: HtmlCanvasElement = document.create_element("canvas")?.dyn_into::<HtmlCanvasElement>()?;

    canvas.set_attribute("width", &width.to_string())?;
    canvas.set_attribute("height", &height.to_string())?;

    Ok((
        canvas.clone(),
        canvas.get_context("2d")?.unwrap().dyn_into::<CanvasRenderingContext2d>()?,
    ))
}

fn for_each_tick(input_manager: Arc<InputManager>) {
    let update_fn = Closure::wrap(Box::new({
        let input_manager = input_manager.clone();
        let window = window().unwrap();

        move || {

        }
    }) as Box<dyn FnMut()>);
}