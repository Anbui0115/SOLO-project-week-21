from .db import db


class Customization(db.Model):
    __tablename__= 'customizations'

    id = db.Column(db.Integer, primary_key=True,autoincrement=True)
    name = db.Column(db.String(50), nullable=False)
    category = db.Column(db.String(50),nullable=False)

    #relationship
    customized_selection = db.relationship('CustomizedSelection',back_populates='customization')
