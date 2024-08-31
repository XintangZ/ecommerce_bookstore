import { ChangeEvent, useEffect, useState } from 'react';
import {
  Box,
  Button,
  Container,
  CssBaseline,
  FormControl,
  Grid,
  InputLabel,
  MenuItem,
  Select,
  SelectChangeEvent,
  TextField,
  Typography,
} from '@mui/material';
import { useAuth } from '../../../contexts';
import { AddressT, UserT } from '../../../types';
import { useGetUser, useUpdateUser } from '../../../services/user.service';
import { Loading } from '../../../components';
import { Navigate, useNavigate } from 'react-router-dom';
import { enqueueSnackbar } from 'notistack';

const provinces = [
  'Alberta',
  'British Columbia',
  'Manitoba',
  'New Brunswick',
  'Newfoundland and Labrador',
  'Northwest Territories',
  'Nova Scotia',
  'Ontario',
  'Prince Edward Island',
  'Quebec',
  'Saskatchewan',
  'Yukon',
];

export function Profile() {
  const { auth } = useAuth();
  const navigate = useNavigate();
  const { data, isPending, isError } = useGetUser(auth?.token as string);
  const [postalCodeError, setPostalCodeError] = useState<string | null>(null);
  const [nameError, setNameError] = useState<string | null>(null);
  const [isDisabled, setIsDisabled] = useState(false);
  const updateUser = useUpdateUser(auth?.token as string);
  const [user, setUser] = useState<UserT>({
    email: '',
    name: '',
    address: {
      street: '',
      city: '',
      postalCode: '',
      province: '',
    } as AddressT,
    wishlist: [],
    isAdmin: false,
  });

  useEffect(() => {
    if (data) {
      setUser({
        email: data.data.email || '',
        name: data.data.name || '',
        address: data.data.address || {
          street: '',
          city: '',
          postalCode: '',
          province: '',
        } as AddressT,
        wishlist: data.data.wishlist || [],
        isAdmin: data.data.isAdmin || false,
      });
    }
  }, [data]);

  useEffect(() => {
    if(nameError || postalCodeError){
      setIsDisabled(true);
    } else {
      setIsDisabled(false);
    }
  }, [nameError, postalCodeError]);

  if (isPending) return <Loading />;
  if (isError) return <Navigate to='/error' replace />;

  const handleInputChange = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const { name, value } = event.target;
    if(name === 'name') {
      if(value === '') {
        setNameError('Name cannot be blank.')
      } else {
        setNameError(null);
      }
    }
    setUser((prevUser) => ({
      ...prevUser,
      [name]: value,
    }));
  };

  const handleAddressChange = (
    event: ChangeEvent<HTMLInputElement>
  ) => {
    const { name, value } = event.target;
    // Postal Code Validation Logic
    if (name === 'postalCode') {
      // Postal Code Validation: First letter, second digit, third letter, space, digit, letter, digit
      const postalCodePattern = /^[A-Za-z]\d[A-Za-z] \d[A-Za-z]\d$/;
  
      if (value === '') {
        // Allow empty postal code
        setPostalCodeError(null);
      } else {
        const isValid = postalCodePattern.test(value);
        if (!isValid) {
          setPostalCodeError('Please enter a valid postal code (e.g., A1A 1A1).');
        } else {
          setPostalCodeError(null);
        }
      }
    }
  
    setUser((prevUser) => ({
      ...prevUser,
      address: {
        ...prevUser.address,
        [name]: value,
      } as AddressT,
    }));
  };

  const handleProvinceChange = (event: SelectChangeEvent<string>) => {
    const { name, value } = event.target;
    setUser((prevUser) => ({
      ...prevUser,
      address: {
        ...prevUser.address,
        [name]: value,
      } as AddressT,
    }));
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    console.log(user);
    const userData = {
    email: user.email,
    name: user.name,
    address: {
      street: user.address?.street || '',
      city: user.address?.city || '',
      postalCode: user.address?.postalCode || '',
      province: user.address?.province || '',
    },
    wishlist: user.wishlist,
    isAdmin: user.isAdmin
    };
    try {
      await updateUser.mutateAsync(userData);
      enqueueSnackbar('Profile updated successfully!', { variant: 'success' });

      navigate('/books');
    } catch (error) {
      // Handle the error, e.g., show an error message
      console.error('Update failed:', error);
    }
  };

  return (
    <Container component="main" maxWidth="sm">
      <CssBaseline />
      <Box
        sx={{
          marginTop: 8,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
        }}
      >
        <Typography component="h1" variant="h5">
          Edit Profile
        </Typography>
        <Box component="form" onSubmit={handleSubmit} sx={{ mt: 3 }}>
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Name"
                name="name"
                value={user.name}
                onChange={handleInputChange}
                error={Boolean(nameError)}
                helperText={nameError}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Email"
                name="email"
                value={user.email}
                onChange={handleInputChange}
                disabled
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Street"
                name="street"
                value={user.address?.street || ''}
                onChange={handleAddressChange}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="City"
                name="city"
                value={user.address?.city || ''}
                onChange={handleAddressChange}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel id="province-label">Province</InputLabel>
                <Select
                  labelId="province-label"
                  name="province"
                  value={user.address?.province || ''}
                  onChange={handleProvinceChange}
                >
                  {provinces.map((province) => (
                    <MenuItem key={province} value={province}>
                      {province}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Postal Code"
                name="postalCode"
                value={user.address?.postalCode || ''}
                onChange={handleAddressChange}
                error={Boolean(postalCodeError)}
                helperText={postalCodeError}
              />
            </Grid>
          </Grid>
          <Button
            type="submit"
            fullWidth
            variant="contained"
            sx={{ mt: 3, mb: 2 }}
            disabled={isDisabled}
          >
            Save Changes
          </Button>
        </Box>
      </Box>
    </Container>
  );
}
