//jshint esversion:6

const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const _ = require("lodash")
const app = express();

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));

mongoose.connect("mongodb+srv://admin-hrishabh:test123@cluster0.z8vjt.mongodb.net/todolistDB", { useNewUrlParser: true, useUnifiedTopology: true });
const itemsSchema = {
    name: String
};

const Item = mongoose.model("Item", itemsSchema);


// Defautl Items
const item1 = new Item({
    name: "Welcome to your todoList!!"
});
const item2 = new Item({
    name: "Hit ➕ Button to Add a New Item"
});
const item3 = new Item({
    name: "🡠 Hit this to delete an Item"
});
const defaultItems = [item1, item2, item3];

app.get("/", function(req, res) {
    Item.find({}, function(err, foundItems) {
        if (foundItems.length === 0) {
            Item.insertMany(defaultItems, function(err) {
                if (err) {
                    console.log(err);
                } else {
                    console.log("Done");
                }
                res.redirect("/")
            })
        } else {
            res.render("list", { listTitle: "Today", newListItems: foundItems });
        }
    });
});

app.post("/", function(req, res) {
    const listName = req.body.list;
    const itemName = req.body.newItem;

    const newItem = new Item({
        name: itemName
    });

    if (listName === "Today") {
        newItem.save()
        res.redirect("/");
    } else {
        List.findOne({ name: listName }, function(err, foundlist) {
            foundlist.items.push(newItem);
            foundlist.save(function(err) {
                if (!err) {
                    res.redirect("/" + listName);
                };
            });
        });
    };

});

app.post("/delete", function(req, res) {
    const id = req.body.checkbox;
    const listName = req.body.listName;

    if (listName === "Today") {
        Item.findByIdAndRemove(id, function(err) {
            if (!err) {
                console.log('Deleted');
                res.redirect("/")
            }
        });
    } else {
        List.findOneAndUpdate({ name: listName }, { $pull: { items: { _id: id } } }, function(err, findList) {
            if (!err) {
                res.redirect("/" + listName);
            }
        })
    }

})

// ----Custom list----

const listSchema = {
    name: String,
    items: [itemsSchema]
};
const List = mongoose.model("List", listSchema);

app.get("/:customlistName", function(req, res) {
    const customlistName = _.capitalize(req.params.customlistName);

    List.findOne({
            name: customlistName,
        },
        function(err, foundlist) {
            if (!err) {
                if (!foundlist) {
                    const list = new List({
                        name: customlistName,
                        items: defaultItems
                    })
                    list.save(function(err) {
                        if (!err) {
                            res.redirect("/" + customlistName)
                        }
                    });

                } else {
                    res.render("list", { listTitle: foundlist.name, newListItems: foundlist.items });
                }
            }
        })

});





app.get("/about", function(req, res) {
    res.render("about");
});


let port = process.env.PORT;
if (port == null || port == "") {
    port = 8000;
}

app.listen(port, function() {
    console.log("Server started on port 3000");
});