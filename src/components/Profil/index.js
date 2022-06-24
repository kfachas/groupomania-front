import { useContext, useEffect, useState } from "react";

import { useNavigate } from "react-router";

import axios from "axios";

import { makeStyles } from "@mui/styles";

import { Alert, Avatar, Button, Grid, TextField } from "@mui/material";
import { Box } from "@mui/system";

import { AppContext } from "../../Context";

const regexEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const regexSpecialChar = /[^A-Za-z0-9_|\s]/g;

const useStyles = makeStyles((theme) => ({
  container: {
    padding: theme.spacing(4),
    height: "100%",
    display: "flex",
    alignItems: "center",
    flexDirection: "column",
    justifyContent: "center",
  },
  gridContainer: {
    alignItems: "center",
    justifyContent: "center",
    "& > div": {
      textAlign: "center",
    },
  },
  input: {
    "& > label": {
      color: "#FFF",
    },
    "& input": {
      color: "#FFF",
    },
  },
  avatar: {
    marginTop: theme.spacing(2),
    textAlign: "center",
    height: "100%",
    width: "100%",
    "& > img": {
      width: 100,
      height: 100,
      borderRadius: "50%",
      objectFit: "cover",
      objectPosition: "center",
    },
  },
}));

const ProfilComponent = ({ handleSnackBarData }) => {
  const { userData } = useContext(AppContext);

  const navigate = useNavigate();

  const classes = useStyles();

  const [values, setValues] = useState({
    file: null,
    firstName: "",
    lastName: "",
    filePreview: null,
    email: "",
  });
  const [confirmPassword, setConfirmPassword] = useState("");

  const fetchUserData = async (userId) => {
    try {
      const res = await axios.get(`http://localhost:3310/users/${userId}`, {
        headers: {
          Authorization: "Bearer " + userData.token,
        },
      });
      if (res && res.data) {
        setValues({ ...values, ...res.data });
      }
    } catch (error) {
      console.error(error.message);
    }
  };

  useEffect(() => {
    userData && fetchUserData(userData.id);
  }, [userData]);

  const [errors, setErrors] = useState({
    email: false,
    password: false,
    firstName: false,
    lastName: false,
  });

  const [errorMsg, setErrorMsg] = useState(null);

  const handleChange = (type, value) => {
    const obj = { ...values };
    obj[type] = value;
    setValues(obj);
  };

  useEffect(() => {
    if (errors.email && values.email.match(regexEmail)) {
      setErrors((prev) => ({ ...prev, email: false }));
    }
    if (
      errors.password &&
      values.password.match(regexSpecialChar) &&
      values.password.trim().length >= 8
    ) {
      setErrors((prev) => ({ ...prev, password: false }));
    }
    if (errors.firstName && values.firstName.trim().length >= 3) {
      setErrors((prev) => ({ ...prev, firstName: false }));
    }
    if (errors.lastName && values.lastName.trim().length >= 3) {
      setErrors((prev) => ({ ...prev, lastName: false }));
    }
  }, [values]);

  const handleChangeFile = (e) => {
    const target = e.target;
    if (!target || !target.files) return;
    const file = target.files[0];

    const filePreview = URL.createObjectURL(file);

    setValues((prev) => ({ ...prev, file, filePreview }));
  };

  const checkBeforeSubmit = (event) => {
    event.preventDefault();
    try {
      const { email, firstName, lastName } = values;
      const password = confirmPassword;
      const newErrors = { ...errors };
      if (!email.match(regexEmail) && !newErrors.email) {
        newErrors.email = true;
      }
      if (
        !newErrors.password &&
        password.length > 0 &&
        (!password.match(regexSpecialChar) || password.trim().length < 8)
      ) {
        newErrors.password = true;
      }

      if (firstName.trim().length < 3 && !newErrors.firstName) {
        newErrors.firstName = true;
      }
      if (lastName.trim().length < 3 && !newErrors.lastName) {
        newErrors.lastName = true;
      }

      if (Object.values(newErrors).filter(Boolean).length > 0) {
        setErrors(newErrors);
        return;
      } else {
        handleSubmit(email.value, password.value);
      }
    } catch (error) {
      console.error(error);
    }
  };

  const handleSubmit = async (data) => {
    try {
      const formData = new FormData();

      formData.append("file", values.file);
      formData.append("firstName", values.firstName);
      formData.append("lastName", values.lastName);
      formData.append("email", values.email);
      formData.append("confirmPassword", confirmPassword);

      const res = await axios.post(
        `http://localhost:3310/users/${userData.id}/update`,
        formData,
        {
          headers: {
            Authorization: "Bearer " + userData.token,
          },
        }
      );

      if (res && res.data) {
        handleSnackBarData({
          severity: "success",
          text: "Modification réussi ! 🙂",
        });
      }
    } catch (error) {
      if (
        error.response &&
        error.response.data &&
        error.response.data.message
      ) {
        setErrorMsg(error.response.data.message);
      }
    }
  };

  return (
    <Grid container spacing={3} sx={{ p: 4 }}>
      <Grid item xs={12}>
        <label onChange={(e) => handleChangeFile(e)} htmlFor="upload-photo">
          <input
            style={{ display: "none" }}
            id="upload-photo"
            name="upload-photo"
            type="file"
          />
          <Button color="secondary" variant="contained" component="span">
            {values.filePreview
              ? "Changer votre photo"
              : "Télécharger votre photo"}
          </Button>
        </label>
        {values.filePreview && (
          <Box textAlign="center" width="100%">
            <Avatar
              alt="selfie"
              src={values.filePreview}
              className={classes.avatar}
            />
          </Box>
        )}
      </Grid>
      <Grid item xs={12} md={6}>
        <TextField
          label="Prénom"
          name="firstname"
          color="secondary"
          placeholder="ex: Jean"
          fullWidth
          className={classes.input}
          value={values.firstName}
          InputLabelProps={{ shrink: true }}
          error={errors.firstName}
          helperText={
            errors.firstName
              ? "Veuillez rentrer votre prénom (3 caractères minimum)."
              : ""
          }
          onChange={(e) => handleChange("firstName", e.target.value)}
        />
      </Grid>
      <Grid item xs={12} md={6}>
        <TextField
          label="Nom"
          name="lastname"
          color="secondary"
          placeholder="ex: Dupont"
          fullWidth
          className={classes.input}
          value={values.lastName}
          InputLabelProps={{ shrink: true }}
          error={errors.lastName}
          helperText={
            errors.lastName
              ? "Veuillez rentrer votre nom (3 caractères minimum)."
              : ""
          }
          onChange={(e) => handleChange("lastName", e.target.value)}
        />
      </Grid>
      <Grid item xs={12} md={6}>
        <TextField
          label="Votre email"
          type="email"
          disabled={true}
          color="secondary"
          fullWidth
          className={classes.input}
          value={values.email}
          InputLabelProps={{ shrink: true }}
        />
      </Grid>
      <Grid item xs={12} md={6}>
        <TextField
          className={classes.input}
          fullWidth
          color="secondary"
          type="password"
          label="Mot de passe pour confirmer la modification"
          helperText={
            errors.password || !!errorMsg
              ? errorMsg || "Veuillez entrer un mot de passe correct."
              : ""
          }
          error={!!errorMsg || errors.lastName}
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
        />
      </Grid>
      <Grid
        item
        xs={12}
        md={12}
        sx={{ display: "flex", justifyContent: "center" }}
      >
        <Box maxWidth="500px">
          <Button
            fullWidth
            onClick={(e) => checkBeforeSubmit(e)}
            variant="contained"
            color="secondary"
            type="submit"
          >
            Modifier
          </Button>
        </Box>
      </Grid>
      {errorMsg && (
        <Grid item xs={12} md={8}>
          <Alert severity="error" onClose={() => setErrorMsg(null)}>
            {errorMsg}
          </Alert>
        </Grid>
      )}
    </Grid>
  );
};

export default ProfilComponent;
