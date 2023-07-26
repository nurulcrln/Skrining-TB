const express = require('express');
const router = express.Router();
const connection = require('../database');

module.exports ={
    index: function (req, res){
        res.render('pages/skrining/user',{
            nama: '',
            tanggal_lahir: ''
        });
    },
    store: function (req, res, next){
        const {nama} = req.body;
        const {tanggal_lahir} = req.body;
        const errors = false;

        if(req.nama === 0) {
            errors = true;

            // set flash message
            req.flash('error', "Silahkan Mengisi Nama Lengkap");
            // render to user.ejs with flash message
            res.render('pages/skrining/user', {
                nama: nama,
                tanggal_lahir: tanggal_lahir
            });
        }

        if(req.tanggal_lahir === 0) {
            errors = true;

            // set flash message
            req.flash('error', "Silahkan Mengisi Tanggal Lahir");
            // render to user.ejs with flash message
            res.render('pages/skrining/user', {
                nama: nama,
                tanggal_lahir: tanggal_lahir
            });
        }

        if(!errors) {

            const formData = {
                nama: nama,
                tanggal_lahir: tanggal_lahir
            }
            
            // insert query
            connection.query('INSERT INTO user SET ?', formData, function(err, result) {
                //if(err) throw err
                if (err) {
                    req.flash('error', err);
                     
                    res.render('pages/skrining/user', {
                        nama: formData.nama,
                        tanggal_lahir: formData.tanggal_lahir                    
                    })
                } else {                
                    req.flash('success', 'Data Berhasil Disimpan!');
                    req.session.isUser = true;
                    req.session.userName = formData.nama;
                    req.session.ttl = formData.tanggal_lahir;
                    res.redirect('/skriningform');
                }
            });
        }
    }, 
}