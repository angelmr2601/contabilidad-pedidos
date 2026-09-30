import { supabase } from "./supabase";

export type CatalogoProducto = { id:string; nombre:string; descripcion:string; activo:boolean; updated_at:string; variantes: CatalogoVariante[] };
export type CatalogoVariante = { id:string; producto_id:string; edicion:string; tipo:string; etiqueta:string; precio:number|null; imagen_url:string|null };

export async function cargarCatalogo(): Promise<CatalogoProducto[]> {
  const { data, error } = await supabase.from("catalogo_productos").select("*, variantes:catalogo_variantes(*)").order("updated_at",{ascending:false});
  if (error) throw error;
  return (data ?? []) as CatalogoProducto[];
}
export async function guardarProducto(input:{id?:string;nombre:string;descripcion:string;activo:boolean}) {
  const query = input.id
    ? supabase.from("catalogo_productos").update({nombre:input.nombre,descripcion:input.descripcion,activo:input.activo,updated_at:new Date().toISOString()}).eq("id",input.id).select().single()
    : supabase.from("catalogo_productos").insert({nombre:input.nombre,descripcion:input.descripcion,activo:input.activo}).select().single();
  const {data,error}=await query; if(error) throw error; return data as {id:string};
}
export async function guardarVariante(input:{id?:string;producto_id:string;edicion:string;tipo:string;etiqueta:string;precio:number|null;imagen_url:string|null}) {
  const query=input.id ? supabase.from("catalogo_variantes").update(input).eq("id",input.id).select().single() : supabase.from("catalogo_variantes").insert(input).select().single();
  const {data,error}=await query; if(error) throw error; return data as CatalogoVariante;
}
export async function eliminarVariante(id:string){const {error}=await supabase.from("catalogo_variantes").delete().eq("id",id);if(error)throw error;}
export async function subirImagen(file:File){const safe=file.name.toLowerCase().replace(/[^a-z0-9.]+/g,"-");const path=`${crypto.randomUUID()}-${safe}`;const {error}=await supabase.storage.from("catalogo-productos").upload(path,file,{upsert:false,contentType:file.type});if(error)throw error;const {data}=supabase.storage.from("catalogo-productos").getPublicUrl(path);return data.publicUrl;}