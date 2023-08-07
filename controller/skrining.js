const PDFDocument = require('pdfkit');
const connection = require('../database.js');

module.exports ={
    index: function (req, res){
        if(req.session.isUser == true){
            res.render('pages/skrining/form');
        }
        else {
            res.redirect('/skrining');
        }  
    },
    store: function (req, res){
        const nama = req.session.userName;
        const tanggal_lahir = req.session.ttl;
        const errors = false;
        let userId = [];


        var sql = 'SELECT * FROM user WHERE nama = ? AND tanggal_lahir = ?';
        connection.query(sql, [nama, tanggal_lahir], function(err, result) {
            if(err) {
                throw err;
            } else {
                setValue(result);
            }
        })

        function setValue(value) {
            userId = value;
            req.session.userId = userId[0].id_user;
        
            let index = 1;
            let nilai_user = [
                req.body.p1, req.body.p2, 
                req.body.p3, req.body.p4,
                req.body.p5, req.body.p6,
                req.body.p7, req.body.p8,
                req.body.p9, req.body.p10,
                req.body.p11
            ];

            if(!errors) { 
                while (index <=11){
                    const formData = {
                        id_user: userId[0].id_user,
                        id_gejala: index,
                        nilai_user: nilai_user[index-1]
                    }

                    connection.query('INSERT INTO gejala_user SET ?', formData, function(err, result) {
                        console.log('Gejala user berhasil tersimpan');
                    })
                    index++;
                }
                res.redirect('/skrininghasil');  
            }else {
                req.flash('error', 'Silahkan jawab pertanyaan dengan benar')
                res.redirect('/skrininguser');
            }
        }
        
        
    },
    showHasil : function (req, res){
        if(req.session.isUser == true){
            const nama = req.session.userName;
            const tanggal_lahir = req.session.ttl;
              
            hitungPenyakit(req.session.userId);
            
            function hitungPenyakit(id){
                let id_user = id;
                let nilai_user = [];
                let nilai_pakarParu = [];
                let nilai_pakarPleuritis = [];
                let nilai_pakarLimfa = [];
                var sql = 'SELECT nilai_user FROM gejala_user WHERE id_user = ? ORDER BY id_gejala';
                connection.query(sql, [id_user], function(err, result) {
                    if(err) {
                        throw err;
                    } else {
                        setNilaiUser(result);
                    }
                })
    
                function setNilaiUser(value){
                    for (let i = 0; i<11; i++){
                        nilai_user[i] = value[i].nilai_user;
                        
                    }
                    
                    //    Perhitungan CF TB Paru
                    var sql2 = 'SELECT nilai_pakar FROM detail_penyakit WHERE id_penyakit = 1 ORDER BY id_gejala';
                    connection.query(sql2, function(err, result) {
                        if(err) {
                            throw err;
                        } else {
                            setNilaiPakarParu(result);
                        }
                    })
                    function setNilaiPakarParu(value){
                        for (let i = 0; i<11; i++){
                            nilai_pakarParu[i] = value[i].nilai_pakar;
                        }
    
                        let cfgejalaParu = [];
                        for (let i = 0; i<11; i++){
                            cfgejalaParu[i] = (nilai_pakarParu[i] * nilai_user[i]);
                        } 
            
                        let cfcombineParu = (cfgejalaParu[0] + cfgejalaParu[1] * (1-cfgejalaParu[0]));
            
                        for (let i = 2; i<11; i++){
                            cfcombineParu = (cfcombineParu + cfgejalaParu[i] * (1-cfcombineParu));
                        }
    
                        const paru = cfcombineParu; 
                        
                        // Update data hasil tb pada tabel user
                        connection.query('UPDATE user SET hasil_tbparu = ? WHERE id_user = ?', [paru, id_user], function(err, result) {
                            if (err){
                                console.log ('Hasil TB Paru gagal diupdate');
                                console.log (err);
                            }else {
                                console.log('Hasil TB Paru berhasil diupdate');
                            }
                            
                        })
                    }
    
                    //    Perhitungan CF TB Pleuritis
                    var sql2 = 'SELECT nilai_pakar FROM detail_penyakit WHERE id_penyakit = 2 ORDER BY id_gejala';
                    connection.query(sql2, function(err, result) {
                        if(err) {
                            throw err;
                        } else {
                            setNilaiPakarPleuritis(result);
                        }
                    })
                    function setNilaiPakarPleuritis(value){
                        for (let i = 0; i<11; i++){
                            nilai_pakarPleuritis[i] = value[i].nilai_pakar;
                        } 
    
                        let cfgejalaPleuritis = [];
                        for (let i = 0; i<11; i++){
                            cfgejalaPleuritis[i] = (nilai_pakarPleuritis[i] * nilai_user[i]);
                        } 
                        
                        let cfcombinePleuritis = (cfgejalaPleuritis[0] + cfgejalaPleuritis[1] * (1-cfgejalaPleuritis[0]));
            
                        for (let i = 2; i<11; i++){
                            cfcombinePleuritis = (cfcombinePleuritis + cfgejalaPleuritis[i] * (1-cfcombinePleuritis));
                        }
                        const pleuritis = cfcombinePleuritis;
                        
                        // Update data hasil tb pada tabel user
                        connection.query('UPDATE user SET hasil_tbpleuritis = ? WHERE id_user = ?', [pleuritis, id_user], function(err, result) {
                            if (err){
                                console.log ('Hasil TB Pleuritis gagal diupdate');
                                console.log (err);
                            }else {
                                console.log('Hasil TB Pleuritis berhasil diupdate');
                            }
                            
                        })
                    }
                    
                    //    Perhitungan CF TB Limfadenitis
                    var sql2 = 'SELECT nilai_pakar FROM detail_penyakit WHERE id_penyakit = 3 ORDER BY id_gejala';
                    connection.query(sql2, function(err, result) {
                        if(err) {
                            throw err;
                        } else {
                            setNilaiPakarLimfa(result);
                        }
                    })
                    function setNilaiPakarLimfa(value){
                        for (let i = 0; i<11; i++){
                            nilai_pakarLimfa[i] = value[i].nilai_pakar;
                        } 
                        
                        let cfgejalaLimfa = [];
                        for (let i = 0; i<11; i++){
                            cfgejalaLimfa[i] = (nilai_pakarLimfa[i] * nilai_user[i]);
                        } 
            
                        let cfcombineLimfa  = (cfgejalaLimfa[0] + cfgejalaLimfa[1] * (1-cfgejalaLimfa[0]));
            
                        for (let i = 2; i<11; i++){
                            cfcombineLimfa = (cfcombineLimfa + cfgejalaLimfa[i] * (1-cfcombineLimfa));
                        }
                        
                        const limfadenitis = cfcombineLimfa;
                        // Update data hasil tb pada tabel user
                        connection.query('UPDATE user SET hasil_tblimfadenitis = ? WHERE id_user = ?', [limfadenitis, id_user], function(err, result) {
                        if (err){
                            console.log ('Hasil TB limfadenitis gagal diupdate');
                            console.log (err);
                        }else {
                            console.log('Hasil TB limfadenitis berhasil diupdate');
                        }
                        
                        })
    
                    }    
                    
                } //end  set nilai user
                
            }//end set hitung penyakit function
    
            var sql = 'SELECT nilai_user FROM gejala_user WHERE id_user = ? ORDER BY id_gejala';
            connection.query(sql, [req.session.userId], function(err, result) {
                if(err) {
                    throw err;
                } else {
                    setNilaiUser(result);
                }
            });
    
            function setNilaiUser(value){
                let nilai_user = [];
                let listGejala = [];
                let saran = [];
                let diagnosa = '';
                let title = '';
                let hasilParu = ''
                let hasilPleuritis = '';
                let hasilLimfa = '';
                for (let i = 0; i<11; i++){ 
                    if (value[i].nilai_user == 0){
                        nilai_user[i] = 'Tidak';
                    } else if (value[i].nilai_user == 0.2){
                        nilai_user[i] = 'Kemungkinan Kecil';
                    } else if (value[i].nilai_user == 0.4){
                        nilai_user[i] = 'Mungkin';
                    } else if (value[i].nilai_user == 0.6){
                        nilai_user[i] = 'Kemungkinan Besar';
                    } else if (value[i].nilai_user == 0.8){
                        nilai_user[i] = 'Hampir Pasti';
                    } else if (value[i].nilai_user == 1){
                        nilai_user[i] = 'Pasti';
                    } 
                } 
    
                connection.query('SELECT nama_gejala FROM gejala ORDER BY id_gejala', function(err, result) {
                    if(err) {
                        throw err;
                    } else {
                        setGejala(result);
                    }
                })
    
                function setGejala (value){
                    for (let i = 0; i < 11; i++){
                        listGejala[i]= value[i].nama_gejala;
                    }
                    connection.query('SELECT saran FROM penyakit ORDER BY id_penyakit', function(err, result) {
                        if(err) {
                            throw err;
                        } else {
                            setSaran(result);
                        }
                    })
    
                    function setSaran (value){
    
                        saran[0] = 'Terapkan perilaku hidup bersih dan sehat. Konsumsi makanan yang bergizi dan tinggi protein. Melakukan pemeriksaan diri di rumah sakit.';
                        for(let i = 1; i<4; i++){
                            saran[i] = value[i-1].saran;
                        }
                        
    
                        connection.query('SELECT hasil_tbparu, hasil_tbpleuritis, hasil_tblimfadenitis  FROM user WHERE id_user = ?',[req.session.userId], function(err, result) {
                            if(err) {
                                throw err;
                            } else {
                                setHasil(result);
                            }
                        })
    
    
                        function setHasil(value){
                            hasilParu = value[0].hasil_tbparu;
                            hasilPleuritis = value[0].hasil_tbpleuritis;
                            hasilLimfa = value[0].hasil_tblimfadenitis;
                        
                            hasilParu =  hasilParu*100;
                            hasilPleuritis = hasilPleuritis*100;
                            hasilLimfa = hasilLimfa*100;
                            hasilMax = Math.max(hasilParu, hasilPleuritis, hasilLimfa);
                            let showsaran = '';
                            
                            if(hasilMax == hasilParu) {
                                if(hasilParu < 75){
                                    diagnosa = 0;
                                    title = 'Bukan TB';
                                    showsaran = saran[0];
                                } else {
                                    diagnosa = hasilParu.toPrecision(2);
                                    title = 'TB Paru';
                                    showsaran= saran[1];
                                }
                            } else if (hasilMax == hasilPleuritis){
                                if(hasilPleuritis < 75){
                                    diagnosa = 0;
                                    title = 'Bukan TB';
                                    showsaran = saran[0];
                                } else {
                                    diagnosa = hasilPleuritis.toPrecision(2);
                                    title = 'TB Pleuritis';
                                    showsaran= saran[2];
                                }
                            } else if (hasilMax == hasilLimfa){
                                if(hasilLimfa < 75){
                                    diagnosa = 0;
                                    title = 'Bukan TB';
                                    showsaran = saran[0];
                                } else {
                                    diagnosa = hasilLimfa.toPrecision(2);
                                    title = 'TB Limfadenitis';
                                    showsaran= saran[3];
                                }
                            }
    
                            res.render('pages/skrining/hasil', {
                                nama: nama,
                                tanggal_lahir: tanggal_lahir,
                                hasilParu : hasilParu.toPrecision(4),
                                hasilPleuritis : hasilPleuritis.toPrecision(4),
                                hasilLimfa : hasilLimfa.toPrecision(4),
                                diagnosa : diagnosa,
                                title : title,
                                gejala: listGejala,
                                nilai_user : nilai_user,
                                saran: showsaran
                            });
                        }
                    }
                }               
            } //end of function nilai_user
        }
        else {
            res.redirect('/skrining');
        } 
    },
    download : function (dataCallback, endCallback, id){
        connection.query('SELECT * FROM user WHERE id_user = ?', [id], function (err, result) {
            if(err) {
                throw err;
            } else {
                setUser(result);
            }
        });

        function setUser(value){
            let userId = value[0].id_user;
            let nama = value[0].nama;
            let tanggal_lahir = value[0].tanggal_lahir;
            let bulan = (tanggal_lahir.getMonth()+1);
            let tahun = tanggal_lahir.getFullYear();
            let tanggal = tanggal_lahir.getDate();
            let ttl = tanggal + " - " + bulan + " - "+ tahun;


            var sql = 'SELECT nilai_user FROM gejala_user WHERE id_user = ? ORDER BY id_gejala';
            connection.query(sql, [userId], function(err, result) {
                if(err) {
                    throw err;
                } else {
                    setNilaiUser(result);
                }
            });

            function setNilaiUser(value){
                let nilai_user = [];
                let listGejala = [];
                let saran = [];
                let diagnosa = '';
                let title = '';
                let hasilParu = ''
                let hasilPleuritis = '';
                let hasilLimfa = '';
                for (let i = 0; i<11; i++){ 
                    if (value[i].nilai_user == 0){
                        nilai_user[i] = 'Tidak';
                    } else if (value[i].nilai_user == 0.2){
                        nilai_user[i] = 'Kemungkinan Kecil';
                    } else if (value[i].nilai_user == 0.4){
                        nilai_user[i] = 'Mungkin';
                    } else if (value[i].nilai_user == 0.6){
                        nilai_user[i] = 'Kemungkinan Besar';
                    } else if (value[i].nilai_user == 0.8){
                        nilai_user[i] = 'Hampir Pasti';
                    } else if (value[i].nilai_user == 1){
                        nilai_user[i] = 'Pasti';
                    } 
                } 

                connection.query('SELECT nama_gejala FROM gejala ORDER BY id_gejala', function(err, result) {
                    if(err) {
                        throw err;
                    } else {
                        setGejala(result);
                    }
                })

                function setGejala (value){
                    for (let i = 0; i < 11; i++){
                        listGejala[i]= value[i].nama_gejala;
                    }
                    connection.query('SELECT saran FROM penyakit ORDER BY id_penyakit', function(err, result) {
                        if(err) {
                            throw err;
                        } else {
                            setSaran(result);
                        }
                    })
                    
                    function setSaran (value){

                        saran[0] = 'Hidup Sehat selalu!';
                        for(let i = 1; i<4; i++){
                            saran[i] = value[i-1].saran;
                        }
                        

                        connection.query('SELECT hasil_tbparu, hasil_tbpleuritis, hasil_tblimfadenitis, created_at  FROM user WHERE id_user = ?',[userId], function(err, result) {
                            if(err) {
                                throw err;
                            } else {
                                setHasil(result);
                            }
                        })


                        function setHasil(value){
                            hasilParu = value[0].hasil_tbparu;
                            hasilPleuritis = value[0].hasil_tbpleuritis;
                            hasilLimfa = value[0].hasil_tblimfadenitis;
                            let date = value[0].created_at;
                            let tahun = date.getFullYear();
                            let bulan = (date.getMonth()+1);
                            let tanggal = date.getDate();
                            let created = tanggal + " - " + bulan + " - "+ tahun;

                            hasilParu = hasilParu*100;
                            hasilPleuritis = hasilPleuritis*100;
                            hasilLimfa = hasilLimfa*100;
                            hasilMax = Math.max(hasilParu, hasilPleuritis, hasilLimfa);
                            let showsaran = '';
                            
                            if(hasilMax == hasilParu) {
                                if(hasilParu < 75){
                                    diagnosa = 0;
                                    title = 'Bukan TB';
                                    showsaran = saran[0];
                                } else {
                                    diagnosa = hasilParu;
                                    title = 'TB Paru';
                                    showsaran= saran[1];
                                }
                            } else if (hasilMax == hasilPleuritis){
                                if(hasilPleuritis < 75){
                                    diagnosa = 0;
                                    title = 'Bukan TB';
                                    showsaran = saran[0];
                                } else {
                                    diagnosa = hasilPleuritis;
                                    title = 'TB Pleuritis';
                                    showsaran= saran[2];
                                }
                            } else if (hasilMax == hasilLimfa){
                                if(hasilLimfa < 75){
                                    diagnosa = 0;
                                    title = 'Bukan TB';
                                    showsaran = saran[0];
                                } else {
                                    diagnosa = hasilLimfa;
                                    title = 'TB Limfadenitis';
                                    showsaran= saran[3];
                                }
                            }
            
                            let data = {
                                nama : nama,
                                tanggal_lahir : ttl,
                                hasil_tbparu : hasilParu,
                                hasil_tbpleuritis : hasilPleuritis,
                                hasil_tblimfadenitis : hasilLimfa,
                                diagnosa : diagnosa,
                                title : title,
                                saran : showsaran,
                                gejala : listGejala,
                                nilai_user : nilai_user,
                                created : created
                            }; 
                
                            function createHasil(data, path) {
                                let doc = new PDFDocument({ margin: 50 });
                                
                                doc.on('data', path);
                                generateHeader(doc, data); 
                                generateSkriningInformation(doc, data);
                                generateGejalaTable(doc, data);
                                generateFooter(doc); 
                
                                doc.on('end', endCallback);
                                doc.end();        
                            }
                
                            function generateHeader(doc, data) {
                                doc.fillColor('#444444')
                                    .fontSize(20)
                                    .text('Hasil Skrining TB', 110, 57)
                                    .fontSize(10)
                                    .text(`${nama} (${ttl})`, 200, 65, { align: 'right' })
                                    .text(`Dibuat tanggal : ${data.created}`, 200, 80, { align: 'right' })
                                    .moveDown();
                            }
                            function generateSkriningInformation(doc, data) {
                                doc.font("Helvetica-Bold");
                                doc
                                    .fillColor("#444444")
                                    .fontSize(10)
                                    .text("Report Skrining Awal TB   :", 50, 130)
                                    .font("Helvetica")
                                    .text(`${data.title}`, 200, 130);
                                generateHr(doc, 150);
                
                                const SkriningInformationTop = 165;
                
                                doc
                                    .font("Helvetica")
                                    .fontSize(10)
                                    .text("TB Paru", 50, SkriningInformationTop)
                                    .text(":", 130, SkriningInformationTop)
                                    .font("Helvetica")
                                    .text(`${data.hasil_tbparu}%`, 150, SkriningInformationTop)
                                    .font("Helvetica")
                                    .text("TB Pleuritis", 50, SkriningInformationTop + 15)
                                    .text(":", 130, SkriningInformationTop + 15)
                                    .text(`${data.hasil_tbpleuritis}%`, 150, SkriningInformationTop +15)
                                    .font("Helvetica")
                                    .text("TB Limfadenitis", 50, SkriningInformationTop + 30)
                                    .text(":", 130, SkriningInformationTop + 30)
                                    .text(`${data.hasil_tblimfadenitis}%`, 150, SkriningInformationTop + 30)
                                    .moveDown();
                
                                generateHr(doc, 220);
                                
                                doc
                                    .fontSize(10)
                                    .text("Saran", 50, SkriningInformationTop + 70)
                                    .text(":", 130, SkriningInformationTop + 70)
                                    .font("Helvetica")
                                    .text(data.saran, 150, SkriningInformationTop + 70, { width: 400 })
                                    .moveDown();

                                generateHr(doc, 280);
                            }
                
                            function generateGejalaTable(doc, data) {
                                let i;
                                const gejalaTableTop = 300;
                
                                doc.font("Helvetica-Bold");
                                generateTableRow(
                                    doc,
                                    gejalaTableTop,
                                    "No",
                                    "Gejala",
                                    "Jawaban",
                                );
                                generateHr(doc, gejalaTableTop + 20);
                                doc.font("Helvetica");
                
                                for (i = 0; i <11; i++) {
                                    let nomor = i+1;
                                    const gejala = data.gejala[i];
                                    const jawaban = data.nilai_user[i];
                                    const position = gejalaTableTop + (i + 1) * 30;
                                    generateTableRow(
                                    doc,
                                    position,
                                    nomor,
                                    gejala,
                                    jawaban,
                                    );
                
                                    generateHr(doc, position + 20);
                                }
                
                                doc.font("Helvetica");
                            }
                
                            function generateTableRow(
                                doc,
                                y,
                                no,
                                gejala,
                                jawaban,
                                ) {
                                doc
                                    .fontSize(10)
                                    .text(no, 50, y, { width: 50, align: "center" })
                                    .text(gejala, 120, y, { width: 300, align: "center" })
                                    .text(jawaban, 440, y, { width: 90, align: "center" });
                            }
                
                            function generateHr(doc, y) {
                                doc
                                    .strokeColor("#aaaaaa")
                                    .lineWidth(1)
                                    .moveTo(50, y)
                                    .lineTo(550, y)
                                    .stroke();
                            }
                            function generateFooter(doc) {
                                doc.font("Helvetica-Bold");
                                doc.fontSize(
                                    10,
                                ).text(
                                    'Hasil skrining TB ini hanya berupa kemungkinan terdiagnosa penyakit TB. Disarankan pergi ke rumah sakit atau pusat pelayanan kesehatan terdekat untuk mendapatkan diagnosa pasti oleh dokter dan melakukan pengobatan',
                                    100,
                                    700,
                                    { align: 'center', width: 400 },
                                );
                            }
                            createHasil(data, dataCallback);
                
                        }
                    }
                }               
            }
        }
    }
}