import { useState, useEffect } from "react";
import {
  createCustomizedItem,
  getAllCustomizedItems,
} from "../../store/customizedItem";
import { useDispatch, useSelector } from "react-redux";
import { Redirect, useHistory, useParams } from "react-router-dom";
import { addCustomizedSelectionToCustomizedItem } from "../../store/customized_selections";
import Customization from "../Customization/Customization";
import { getAllItems } from "../../store/items";
import styles from "./CreateCustomizedItem.module.css";
import item_detail_styles from "../GetItemById/GetItemById.module.css";

const CreateCustomizedItem = () => {
  const dispatch = useDispatch();
  const history = useHistory();

  const [name, setName] = useState("");
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [customizationSelected, setCustomizationSelected] = useState({});
  const [errors, setErrors] = useState([]);

  useEffect(() => {
    dispatch(getAllCustomizedItems());
    dispatch(getAllItems());
  }, [dispatch]);

  useEffect(() => {
    const nameStr = name.toString().trim();
    let errors = [];
    if (nameStr.length < 4 || nameStr.length > 50)
      errors.push(
        "Name needs to be between 4 and 50 characters, excluding leading and trailing spaces"
      );
    return setErrors(errors);
  }, [name]);

  const allItems = useSelector((state) => state.items);
  const sessionUser = useSelector((state) => state.session.user);
  const { itemId } = useParams();

  if (!itemId) return null;
  if (!sessionUser) return <Redirect to="/" />;
  const item = allItems[itemId];

  const onSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitted(true);
    if (errors.length) return;

    setErrors([]);
    const data = await dispatch(
      createCustomizedItem(sessionUser.id, itemId, name)
    ).catch(async (res) => {
      const data = await res.json();
      if (data && data.errors) setErrors(data.errors);
    }); // data should contain newly created customized item's ID

    // create new customized selection object using customized item ID from above
    // and customization ID from customizationSelected

    if (data) {
      for (let i in customizationSelected) {
        if (customizationSelected[i] != 0) {
          // console.log("=======customization_id:", customizationSelected[i]);
          const new_customized_selection = await dispatch(
            addCustomizedSelectionToCustomizedItem(
              customizationSelected[i],
              data.id
            )
          );
        }
      }
      history.push(`/my-customized-items`);
    }
  };

  return (
    <div className={styles.create_drink_body}>
      <div className={item_detail_styles.item_top_page}>
        <div className={item_detail_styles.item_img_container}>
          <img
            src={item?.image_url}
            className={item_detail_styles.item_img}
          ></img>
        </div>

        <div className={item_detail_styles.item_name_calories}>
          <div className={item_detail_styles.item_name}>
            <div>{item?.name}</div>
          </div>
          <div className={item_detail_styles.item_calories}>
            {item?.calories} calories
          </div>
        </div>
      </div>

      {/* ----------------------- */}
      <div className={styles.create_div}>
        <form onSubmit={(e) => onSubmit(e)}>
          {isSubmitted && (
            <div className={styles.error_wrapper}>
              {errors.map((error) => (
                <div className={styles.error} key={error}>
                  {error}
                </div>
              ))}
            </div>
          )}

          <div className={styles.drink_name}>
            <label>
              <div className={styles.name}>Name your drink</div>
              <input
                className={styles.name_input}
                type="text"
                name="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </label>
          </div>
          <div className={styles.custom}>
            <Customization
              customizationSelected={customizationSelected}
              setCustomizationSelected={setCustomizationSelected}
            />
          </div>

          <div className={styles.button_div}>
            <button
              className={styles.addToCartButton_wrapper}
              type="submit"
              disabled={isSubmitted && errors.length > 0}
            >
              <div className={styles.addToCartButton}>Save </div>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
export default CreateCustomizedItem;
/*
customizationSelected is a reference in memory that is an object containing {category: customization_id}
for example: {milk:1} or {milk: '7', flavor: '16'} depending on the selected field in CreateCustomizedItem
CreateCustomizedItem(parent componentt) pass down customizationSelected as props to Customization(child component)
Within child Customization, any changes being made to customizationSelected is reflected in the parent component as well
For that reason, even though the selection for customization(changes) is being made inside the Customization(child component),
the parent component CreateCustomizedItem still have reference to the same object customizationSelected

--------JS pass props as reference, not value.
This means as long as parent pass down a props via the same reference in memory,
any changes being to that reference in memory will be reflected in the parent component-----------
*/
