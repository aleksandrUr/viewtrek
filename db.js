const express = require("express");
const app = express();

const {Sequelize} = require("sequelize");
const db = new Sequelize("viewtrek","root","",{

    host: "localhost",
    dialect: "mysql"

})

export default db;