
const express = require("express");
const bodyParser = require("body-parser");
const path = require("path")
const app = express();
const nodemailer = require('nodemailer');
const multer = require('multer');
const session = require('express-session');
const { body, validationResult } = require('express-validator');
const flash = require('express-flash');
const fs = require("fs")
const formdata = multer();

const { logearse, registrarse, ponerFoto, darLike, comentar, subcomentar } = require("./Controllers/UsuarioController")

app.use(bodyParser.urlencoded({ extended: false }));


app.use(bodyParser.json());

const storageVideos = multer.diskStorage({
    destination: function (req, file, cb) {
        if (file.fieldname === 'videoUrl') {
            cb(null, './videos');
        } else if (file.fieldname === 'portada') {
            cb(null, './portadas');
        }
    },
    filename: function (req, file, cb) {
        cb(null, Date.now() + '-' + file.originalname);
    }
});

const uploadVideos = multer({
    storage: storageVideos,
    fileFilter: function (req, file, cb) {

        if (file.fieldname === "videoUrl") {

            const ext = file.originalname.split('.').pop().toLowerCase();

            console.log(ext)

            const allowedExtensions = ['mp4', 'avi', 'mov', 'mkv', 'wmv']

            if (allowedExtensions.includes(ext)) {
                cb(null, true);
            } else {

                cb(new Error('El archivo debe ser un video.'));
            }
            console.log(allowedExtensions.includes(ext))


        } else if (file.fieldname == "portada") {

            const ext = file.originalname.split('.').pop().toLowerCase();

            const allowedExtensions = ['jpg', 'jpeg', 'png', 'gif'];

            if (allowedExtensions.includes(ext)) {
                cb(null, true);
            } else {

                cb(new Error('El archivo debe ser una imagen.'));
            }



        }


    }
}).fields([{ name: 'videoUrl', maxCount: 1 }, { name: 'portada', maxCount: 1 }]);


async function sendEmail() {
    try {
        // Configurar el transporte
        let transporter = nodemailer.createTransport({
            service: 'gmail',
            port: 465,
            logger: true,
            secure: true,
            debug: true,
            secureConnection: true,
            auth: {
                user: 'la.prima.de.sebas777@gmail.com',  // Tu dirección de correo electrónico
                pass: 'huvdvboiacdbhodr'  // Tu contraseña de correo electrónico
            },
            tls: {
                rejectUnauthorized: true

            }
        });

        // Configurar el correo electrónico
        let mailOptions = {
            from: 'la.prima.de.sebas777@gmail.com',  // Remitente
            to: 'pedro123ggpro@gmail.com',  // Destinatario
            subject: 'Prueba de Nodemailer',  // Asunto
            text: 'Este es un correo electrónico de prueba enviado con Nodemailer.'  // Contenido del correo
        };



        // Enviar el correo electrónico

        let info = await transporter.sendMail(mailOptions);




        console.log('Correo electrónico enviado:', info.messageId);
    } catch (error) {
        console.error('Error al enviar el correo electrónico:', error);
    }
}


app.use(session({
    secret: 'mysecretkey',
    resave: false,
    saveUninitialized: false,
    cookie: {
        maxAge: 24 * 60 * 60 * 1000 // Tiempo de expiración de la sesión en milisegundos (24 horas)
    }
}));

app.use(flash());

const { Sequelize, where, UUIDV4 } = require("sequelize");
const db = new Sequelize("viewtrek", "root", "", {

    host: "localhost",
    dialect: "mysql"

})


const ejs = require("ejs");

const { Usuario, sequelize } = require('./models');

const { send } = require("process");
const { error } = require("console");
const usuario = require("./models/usuario");
const { getSystemErrorMap } = require("util");
const { Categoria } = require("./models");
const { Comentarios } = require("./models")
const { Historial } = require("./models");
const { Video } = require("./models");
const Ffmpeg = require("fluent-ffmpeg");
const e = require("express");
const { promises } = require("dns");
const categoria = require("./models/categoria");
const video = require("./models/video");
app.set("view engine", "ejs");
app.use(express.static('public'));

const comprobarUsuario = (req, res, next) => {

    if(req.session.usuario == undefined){

        res.redirect("/login");
        return;

    }
    
    next();
  };
  

app.get("/",comprobarUsuario, async (req, res) => {

    let usuario = await Usuario.findByPk(req.session.usuario.id);

    let vistos = await usuario.getVistos();

    Promise.all(vistos.map((visto) => {

        return new Promise((resolve, reject) => {

            visto.getCategoria().then((data) => {

                resolve(data.flat())
                return

            })

        });


    })).then(data => {

        data = data.flat().sort(() => Math.random() - 0.5)

        Promise.all(data.map(categoria => {

            return new Promise((resolve, reject) => {

                categoria.getVideo().then(data => {

                    resolve(data)

                })

            });

        })).then(async (data) => {

            data = data.flat().sort(() => Math.random() - 0.5);

            let videos = [];

            data.forEach(video => {
                if (!videos.find(videoB => videoB.id == video.id)) {
                    videos.push(video)
                }
            })

            let likeados = await usuario.getLikeados();

            Promise.all(videos.map(async (video) => {

                return new Promise((resolve, reject) => {

                    darInfoVideo(video, likeados).then(data => {

                        resolve(data);

                    })

                });



            })).then(data => {

                res.render("index", { "videos": data })
                return
            });

        })


    })


})

function darInfoVideo(video, likeados) {


    return new Promise(async (resolve, reject) => {

        if (video.portada != null) {

            try {

                base64 = fs.readFileSync("./portadas/" + video.portada, "base64");
            } catch (e) {

                base64 = "";

            }

        } else {
            base64 = "";
        }

        let metadatos = await obtenerMetadatos(video.videoUrl);

        minutos = Math.floor(metadatos.format.duration / 60);
        segundos = Math.floor(metadatos.format.duration % 60)

        let base64Video = "";

        if (video.videoUrl != null) {
            base64Video = fs.readFileSync("./videos/" + video.videoUrl, "base64");
        } else {
            base64Video = "";
        }
        let tipolike = "";

        let comprobar = likeados.find(likeado => likeado.id == video.id);

        if (comprobar) {

            tipolike = comprobar.Likes.tipo;

        }

        let likes = await video.getLikeos();
        let comentarios = await video.getComentados();
        let cantidadlikes = likes.filter(like => like.Likes.tipo == "like").length;


        resolve({

            "id": video.id,
            "titulo": video.titulo,
            "videoUrl": base64Video,
            "duracion": minutos + ":" + segundos,
            "vistas": video.vistas,
            "tipolike": tipolike,
            "likes": cantidadlikes,
            "dislikes": likes.length - cantidadlikes,
            "cantidadComentarios": comentarios.length

        });

    });

}

app.get("/publicar",comprobarUsuario, (req, res) => {

    res.render("publicar", { "errores": req.flash("errores") })

})


app.get("/videos/:numVideo",comprobarUsuario, async (req, res) => {

    let videoModelo = await Video.findByPk(req.params.numVideo);

    videoModelo.vistas += 1;

    await videoModelo.save();

    let usuario = await Usuario.findByPk(req.session.usuario.id);

    console.log(usuario.id);

    let view = await Historial.create({
        "UsuarioId": usuario.id,
        "VideoId": videoModelo.id
    });

    await view.save();

    let likeados = await usuario.getLikeados();

    darInfoVideo(videoModelo, likeados).then(async data => {

        let base64 = "";

        try {
            base64 = fs.readFileSync("./fotosPerfil/" + usuario.foto, "base64");
        } catch (e) {
            console.error('Error al leer la imagen del usuario:', e);
        }

        let comentarios = await videoModelo.getComentados({
            include: [
                {
                    model: Comentarios,
                    as: 'Comentarios',
                    attributes: ['id', 'VideoId', 'UsuarioId', 'comentario', 'createdAt', 'updatedAt']
                }
            ]
        })

        Promise.all(comentarios.map(comentario => {

            return new Promise((resolve, reject) => {

                let base64 = "";

                try {
                    base64 = fs.readFileSync("./fotosPerfil/" + comentario.foto, "base64");
                } catch (e) {
                    console.error('Error al leer la imagen del usuario:', e);
                }

                comentario.Comentarios.getSubcomentados().then(subcomentados => {

                    Promise.all(subcomentados.map(subcomentado => {

                        return new Promise((resolve, reject) => {
                            
                            Usuario.findByPk(subcomentado.UsuarioId).then(usuarioSub => {

                                try {
                                    base64sub = fs.readFileSync("./fotosPerfil/" + usuarioSub.foto, "base64");
                                } catch (e) {
                                    console.error('Error al leer la imagen del usuario:', e);
                                }

                                resolve({

                                   "base64sub" : base64sub,
                                    "nombreSub" : usuarioSub.nombre,
                                    "subcomentario" : subcomentado.comentario

                                })
                            })
                        });
                    })).then(subcomentados => {

                        resolve({

                            "id": comentario.Comentarios.id,
                            "nombre": comentario.nombre,
                            "comentario": comentario.Comentarios.comentario,
                            "foto": base64,
                            "subcomentarios" : subcomentados

                        })

                    })



                });

            });

        })).then(dataComentarios => {
            
            res.render("video", { "video": data, "foto": base64, "usuario": req.session.usuario, "comentarios": dataComentarios });
        })
    });
});

                        

             
app.post("/publicar",comprobarUsuario, (req, res) => {

    uploadVideos(req, res, async function (err) {
        if (err instanceof multer.MulterError) {
            console.log(req.body, req.file.mimetype)
            req.flash("errores", err.message)
            res.redirect("/publicar")
            return
        } else if (err) {

            req.flash("errores", err.message)
            res.redirect("/publicar")
            return
        }

        if (req.body.nombre.trim() == "" || req.body.descripcion.trim() == "") {

            req.flash("errores", "Nombre y descripcion requerido!!")
            res.redirect("/publicar")
            return

        }

        console.log(req.body)


        if (req.files["videoUrl"] == undefined) {
            req.flash("errores", "No hay video!!")
            res.redirect("/publicar")
            return
        }

        if (req.files["portada"] == undefined) {

            let nombrePortada = Date.now() + "-frame.png"

            Ffmpeg(req.files["videoUrl"][0].path)
                .seekInput(1)
                .frames(1)
                .output("./portadas/" + nombrePortada)
                .on('end', async () => {

                    crearVideo(nombrePortada, req)
                    res.redirect("cuenta");
                    return

                })
                .on('error', (err) => {
                    console.error('Error al extraer el fotograma:', err);
                }).run();


        } else {

            crearVideo(req.files["portada"][0].filename, req)
            res.redirect("cuenta");
            return 0;

        }

    })

})

app.post("/subcomentar",comprobarUsuario, formdata.none(), subcomentar);

async function crearVideo(nombrePortada, req) {

    let cuerpo = req.body;

    let video = await Video.create({

        titulo: cuerpo.nombre,
        descripcion: cuerpo.descripcion,
        fecha: "f",
        videoUrl: req.files["videoUrl"][0].filename,
        portada: nombrePortada,
        vistas: 0

    })

    let usuario = await Usuario.findByPk(req.session.usuario.id);

    usuario.addVideo(video);


    let categorias = (cuerpo.categorias).split(",")

    categorias = categorias.map(categoria => {

        categoria = String(categoria).replace(" ", "");

        return categoria.trim()

    });

    let catPendientes = [];

    (categorias.forEach(async function (categoria) {
        let promesa = new Promise((resolve, reject) => {

            Categoria.findOne({
                where: {
                    "nombre": categoria.toLowerCase()
                }

            }).then(data => {

                if (data) {

                    data.addVideo(video).then(data => {
                        resolve(0)
                    })
                }

                else {

                    Categoria.create({
                        "nombre": categoria.toLowerCase()
                    }).then(data => {
                        data.addVideo(video).then(data => {
                            resolve(0)
                        })
                    })
                }
            })
        })
        catPendientes.push(promesa);
    }))


    Promise.all(catPendientes).then(data => {

        return 0;

    })

}


app.get("/login", (req, res) => {

    res.render("login", { errorMessages: req.flash('mensaje'), color: req.flash("color") })

})

app.get("/formulario",comprobarUsuario, (req, res) => {

    res.render("formulario", { errorMessages: req.flash('mensaje'), color: req.flash("color") })

})

app.post("/registrarse",
    body('nombre').isLength({ max: 19 }).withMessage('El nombre debe tener menos de 20 caracteres')
        .matches(/[A-Z]/).withMessage('El nombre debe contener al menos una mayúscula')
        .matches(/\d/).withMessage('El nombre debe contener números'), body("email").isEmail().withMessage("Correo no valido"),
    body("contrasena").notEmpty().withMessage("Contraseña obligatoria"), registrarse)


app.post("/login", logearse)

app.get("/cuenta",comprobarUsuario, async (req, res) => {

    let usuario = await Usuario.findByPk(req.session.usuario.id)
    let dataF = ""

    try {
        dataF = fs.readFileSync("./fotosPerfil/" + usuario.foto, "base64")
    } catch (e) {
        console.error('Error al leer la imagen del usuario:', e);
    }

    let dataB = ""
    try {
        dataB = fs.readFileSync("./fotosPerfil/" + usuario.banner, "base64")
    } catch (e) {
        console.error('Error al leer la imagen del usuario:', e);
    }


    let videos = await usuario.getVideo();

    videos = await Promise.all(videos.map(async (video) => {
        let base64 = "";

        if (video.portada != null) {
            base64 = fs.readFileSync("./portadas/" + video.portada, "base64");
        } else {
            base64 = "";
        }

        let metadatos = await obtenerMetadatos(video.videoUrl);

        minutos = Math.floor(metadatos.format.duration / 60);
        segundos = Math.floor(metadatos.format.duration % 60)



        return {

            "id": video.id,
            "titulo": video.titulo,
            "portada": base64,
            "duracion": minutos + ":" + segundos,
            "vistas": video.vistas


        };
    }));


    res.render("cuenta", { "usuario": req.session.usuario, "foto": dataF, "banner": dataB, "videos": videos });

})



function obtenerMetadatos(url) {
    return new Promise((resolve, reject) => {
        Ffmpeg.ffprobe("./videos/" + url, (err, metadata) => {
            if (err) {
                reject(err);
            } else {
                resolve(metadata);
            }
        });
    });











}

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, './fotosPerfil'); // Directorio donde se guardarán las imágenes
    },
    filename: function (req, file, cb) {
        cb(null, Date.now() + file.originalname); // Renombrar archivo para evitar colisiones de nombres
    }
});

const upload = multer({
    storage: storage,
    fileFilter: (req, file, cb) => {

        const ext = file.originalname.split('.').pop().toLowerCase();

        const allowedExtensions = ['jpg', 'jpeg', 'png', 'gif'];

        if (allowedExtensions.includes(ext)) {
            cb(null, true);
        } else {
            cb(new Error('El archivo debe ser una imagen.'));
        }
    }
}).single('foto');


app.post('/ponerFoto', (req, res) => {
    upload(req, res, async function (err) {
        if (err instanceof multer.MulterError) {
            console.log(req.body, req.file.mimetype)
            return res.json({});
        } else if (err) {
            return res.json({});
        }

        console.log(req.body, req.file.mimetype)
        let usuario = await Usuario.findByPk(req.session.usuario.id);
        if (usuario) {

            if (req.body.tipo == "f") {
                try {
                    fs.unlinkSync("./fotosPerfil/" + usuario.foto)
                } catch (e) {
                    console.error('Error al leer la imagen del usuario:', e);
                }

                usuario.foto = req.file.filename
                usuario.save();

            } else {

                try {
                    fs.unlinkSync("./fotosPerfil/" + usuario.banner)
                } catch (e) {
                    console.error('Error al leer la imagen del usuario:', e);
                }

                usuario.banner = req.file.filename
                usuario.save();
            }
        }
        let base64 = fs.readFileSync(req.file.path, "base64");
        res.json({ "base64": base64 });
    });
});

app.post("/darLike", formdata.none(), darLike)

app.post("/comentar", formdata.none(), comentar)


app.listen(3000, () => {

    console.log("corriendo");

})
