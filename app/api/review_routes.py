
from flask import Blueprint, jsonify, request
from app.models import User, db, Review,Item
from flask_login import login_required, current_user
from app.models.reviews import Review
from app.forms.add_review import AddReview


review_routes = Blueprint('review', __name__)

@review_routes.route('', methods=["GET"])
@login_required
def get_reviews():
    """
    Get all reviews of current user
    """
    user_id = current_user.id
    reviews = Review.query.filter_by(user_id=user_id).all()
    return {'reviews': [i.to_dict() for i in reviews]}

@review_routes.route('/item/<item_id>', methods=["GET"])
def get_item_reviews(item_id):
    """
    Get all reviews of selected item
    """
    reviews = Review.query.filter_by(item_id=item_id).all()
    return {'reviews': [i.to_dict() for i in reviews]}

# @review_routes.route('', methods=["POST"])
# @login_required
# def add_review():
#     """
#     Add a review for current user base on item_id
#     """
#     user_id = current_user.id
#     print('REQUEST~~~~~~~~~~~~~~~~~~~~',request.args.get(item_id))
#     form = AddReview()
#     form['csrf_token'].data = request.cookies['csrf_token']

#     if form.validate_on_submit():
#         review = Review()
#         form.populate_obj(review)
#         review.user_id = user_id
#         db.session.add(review)
#         db.session.commit()
#         return {'review': review.to_dict()}
#     else:
#         return {'errors': form.errors}, 400

@review_routes.route('/item/<item_id>', methods=["POST"])
@login_required
def add_review(item_id):
    """
    Add a review for current user base on item_id
    """
    user_id = current_user.id
    form = AddReview()
    form['csrf_token'].data = request.cookies['csrf_token']
    if form.validate_on_submit():
        review = Review()
        review.user_id = current_user.id
        form.populate_obj(review)
        review.item_id = item_id
        review.user_id = user_id
        db.session.add(review)
        db.session.commit()
        return {'review': review.to_dict()}
    else:
        return {'errors': form.errors}, 400

@review_routes.route('/<review_id>', methods=["PUT"])
@login_required
def update_review(review_id):
    """
    Update a review for current user w/ review_id
    """
    user_id = current_user.id
    form = AddReview()
    form['csrf_token'].data = request.cookies['csrf_token']

    if form.validate_on_submit():

        review = Review.query.get(review_id)
        if not review:
            return {'errors': 'Review does not exist.'}, 400
        elif review.user_id != user_id:
            return {'errors': 'Review does not belong to current user.'}, 400
        form.populate_obj(review)
        db.session.commit()
        return {'review': review.to_dict()}
    else:
        return {'errors': form.errors}, 400

@review_routes.route('/<review_id>', methods=["DELETE"])
@login_required
def delete_review(review_id):
    """
    Delete a review for current user w/ review_id
    """
    user_id = current_user.id
    review = Review.query.get(review_id)
    if review:
        print('\n\n\n\n', user_id, '\n\n', review.user_id, '\n\n\n\n\n')
        if review.user_id != user_id:
            return {'errors': 'Review does not belong to current user.'}, 400
        db.session.delete(review)
        db.session.commit()
        return {'review': review.to_dict()}, 201
    else:
        return {'errors': 'Review does not exist.'}, 400
