
const { json } = require('body-parser');
const { Usuario } = require('../models');
const { Likes } = require('../models');
const { Comentarios } = require('../models');
const { Subcomentarios } = require('../models');
const { Video } = require("../models");
const { body, validationResult } = require('express-validator');
const fs = require("fs")
const multer = require("multer");
const { col } = require('sequelize');



async function logearse(req, res) {

  let usuario = await Usuario.findOne({
    where: {
      nombre: req.body.nombre
    }
  })

  if (usuario) {

    if (req.body.contrasena == usuario.contrasena) {

      req.session.usuario = usuario;
      res.redirect("/cuenta");
      return


    }

    req.flash("mensaje", "Contraseña incorrecta");
    req.flash("color", "red");
    res.redirect("/login");
    return


  }

  req.flash("mensaje", "El usuario no existe");
  req.flash("color", "red");
  res.redirect("/login");
  return


}



async function registrarse(req, res) {

  let errors = validationResult(req);

  if (!errors.isEmpty()) {

    req.flash("mensaje", errors.array().map(error => error.msg));
    req.flash("color", "red");
    res.redirect("/formulario");
    return;

  }

  let usu = await Usuario.findOne({
    where: {
      nombre: req.body.nombre
    }
  })

  if (usu) {

    req.flash("mensaje", "Ya existe!!!");
    req.flash("color", "red");
    res.redirect("/formulario");
    return

  } else {

    let usuario = await Usuario.create(req.body)
    req.flash("mensaje", "Creado!!!");
    req.flash("color", "green");
    res.redirect("/formulario");
    return
  }

}

async function darLike(req, res) {

  let cuerpo = req.body;

  let color = "";

  let valido = ["like", "dislike"]

  if (!valido.includes(cuerpo.tipo)) {

    res.send({ "error": "No cambien el DOM causas" })
    return;

  }

  let usuario = await Usuario.findByPk(req.session.usuario.id)
  let likeados = await usuario.getLikeados();

  let comprobar = likeados.find(likeado => likeado.id == cuerpo.videoId)

  if (comprobar) {

    await comprobar.Likes.destroy()

    if (comprobar.Likes.tipo != cuerpo.tipo) {

      color = cuerpo.tipo
      let like = await Likes.create({
        "VideoId": cuerpo.videoId,
        "UsuarioId": usuario.id,
        "tipo": cuerpo.tipo
      })

    } else {

      color = "ning"

    }

  } else {

    let like = await Likes.create({
      "VideoId": cuerpo.videoId,
      "UsuarioId": usuario.id,
      "tipo": cuerpo.tipo
    })

    color = cuerpo.tipo

  }

  res.json({ "color": color });
}


async function comentar(req, res) {

  let cuerpo = req.body;

  let usuario = await Usuario.findByPk(req.session.usuario.id)

  let comentario = await Comentarios.create({
    "VideoId": cuerpo.videoId,
    "UsuarioId": usuario.id,
    "comentario": cuerpo.comentario
  })

  try {
    base64 = fs.readFileSync("./fotosPerfil/" + usuario.foto, "base64");
  } catch (e) {
    console.error('Error al leer la imagen del usuario:', e);
  }

  res.json({ "comentario": comentario.comentario, "nombre": usuario.nombre , "base64":base64 });
}

async function subcomentar(req, res) {

  

  let cuerpo = req.body;
  
  console.log(cuerpo)

  let usuario = await Usuario.findByPk(req.session.usuario.id)

  let comentario = await Subcomentarios.create({
    "ComId": parseInt(cuerpo.idComentario),
    "UsuarioId": usuario.id,
    "comentario": cuerpo.comentario
  })

  try {
    base64 = fs.readFileSync("./fotosPerfil/" + usuario.foto, "base64");
  } catch (e) {
    console.error('Error al leer la imagen del usuario:', e);
  }

  res.json({"comentario": comentario.comentario, "nombre": usuario.nombre , "base64":base64 });
}

module.exports = {
  logearse, registrarse, darLike, comentar,subcomentar
}