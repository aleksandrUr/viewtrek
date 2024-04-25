function darLike(event) {

                    let div = event.currentTarget;

                    let clase = div.getAttribute("class");

                    let req = new FormData

                    req.append("videoId", div.parentNode.getAttribute("videoId"));
                    req.append("tipo", clase)

                    console.log(clase)

                    div.disabled = true

                    fetch("/darLike", {

                        method: "post",
                        body: req

                    }).then(data => data.json()).then(data => {

                        let svgs = div.parentNode.children

                        let contLike = svgs[0];
                        let contDislike = svgs[3];

                        switch (data.color) {

                            case "ning":

                                svgs[1].children[0].children[0].setAttribute("fill", "white")
                                svgs[2].children[0].children[0].setAttribute("fill", "white")

                                if (!div.previousElementSibling.classList.contains("like")) {

                                    contLike.textContent = parseFloat(contLike.textContent) - 1;

                                } else {

                                    contDislike.textContent = parseFloat(contDislike.textContent) - 1;

                                }

                                break;

                            case "like":


                                if (svgs[2].children[0].children[0].getAttribute("fill") == "red") {
                                    contDislike.textContent = parseFloat(contDislike.textContent) - 1;

                                }
                                svgs[1].children[0].children[0].setAttribute("fill", "aqua")
                                svgs[2].children[0].children[0].setAttribute("fill", "white")

                                contLike.textContent = parseFloat(contLike.textContent) + 1;

                                break;

                            case "dislike":


                                if (svgs[1].children[0].children[0].getAttribute("fill") == "aqua") {
                                    contLike.textContent = parseFloat(contLike.textContent) - 1;

                                }
                                svgs[1].children[0].children[0].setAttribute("fill", "white")
                                svgs[2].children[0].children[0].setAttribute("fill", "red")
                                contDislike.textContent = parseFloat(contDislike.textContent) + 1;
                                break;

                        }

                        div.disabled = false

                    })



                }