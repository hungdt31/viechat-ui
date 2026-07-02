import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { useNavigate, Link } from 'react-router-dom';
import { toast } from 'sonner';
import { useAuth } from '@/context/AuthContext';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';

const registerSchema = yup.object().shape({
  username: yup.string()
    .required('Username is required')
    .min(3, 'Username must be at least 3 characters')
    .matches(/^[a-zA-Z0-9_]+$/, 'Username must only contain letters, numbers, and underscores'),
  email: yup.string()
    .required('Email is required')
    .email('Invalid email address'),
  password: yup.string()
    .required('Password is required')
    .min(8, 'Password must be at least 8 characters'),
  confirmPassword: yup.string()
    .required('Please confirm your password')
    .oneOf([yup.ref('password')], 'Passwords must match'),
});

type RegisterFormInputs = yup.InferType<typeof registerSchema>;

export const Register: React.FC = () => {
  const { register: authRegister } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const { register, handleSubmit, formState: { errors } } = useForm<RegisterFormInputs>({
    resolver: yupResolver(registerSchema) as any
  });

  const onSubmit = async (data: RegisterFormInputs) => {
    setLoading(true);
    try {
      const success = await authRegister({
        username: data.username,
        email: data.email,
        password: data.password
      });
      if (success) {
        toast.success('Account created successfully!');
        navigate('/');
      } else {
        toast.error('Registration failed. Username or email might be taken.');
      }
    } catch (err) {
      toast.error('An unexpected error occurred.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div className="flex flex-col space-y-2 text-center mb-8">
        <h2 className="text-3xl font-semibold tracking-tight">Create an account</h2>
        <p className="text-sm text-muted-foreground">
          Enter your details to get started with VieChat
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
        {/* Username */}
        <div className="space-y-1">
          <Label htmlFor="username" className="text-xs text-muted-foreground pl-1">Username</Label>
          <Input
            id="username"
            type="text"
            placeholder="johndoe"
            autoComplete="username"
            spellCheck={false}
            className="h-11"
            {...register('username')}
          />
          {errors.username ? (
            <p className="text-destructive text-xs font-medium">{errors.username.message}</p>
          ) : null}
        </div>

        {/* Email */}
        <div className="space-y-1">
          <Label htmlFor="email" className="text-xs text-muted-foreground pl-1">Email</Label>
          <Input
            id="email"
            type="email"
            placeholder="m@example.com"
            autoComplete="email"
            spellCheck={false}
            className="h-11"
            {...register('email')}
          />
          {errors.email ? (
            <p className="text-destructive text-xs font-medium">{errors.email.message}</p>
          ) : null}
        </div>

        {/* Password */}
        <div className="space-y-1">
          <Label htmlFor="password" className="text-xs text-muted-foreground pl-1">Password</Label>
          <Input
            id="password"
            type="password"
            placeholder="••••••••"
            autoComplete="new-password"
            className="h-11"
            {...register('password')}
          />
          {errors.password ? (
            <p className="text-destructive text-xs font-medium">{errors.password.message}</p>
          ) : null}
        </div>

        {/* Confirm Password */}
        <div className="space-y-1">
          <Label htmlFor="confirmPassword" className="text-xs text-muted-foreground pl-1">Confirm Password</Label>
          <Input
            id="confirmPassword"
            type="password"
            placeholder="••••••••"
            autoComplete="new-password"
            className="h-11"
            {...register('confirmPassword')}
          />
          {errors.confirmPassword ? (
            <p className="text-destructive text-xs font-medium">{errors.confirmPassword.message}</p>
          ) : null}
        </div>

        {/* Submit */}
        <Button
          type="submit"
          disabled={loading}
          className="w-full h-11 font-semibold"
        >
          {loading ? 'Creating Account ...' : 'Sign Up'}
        </Button>
      </form>

      <div className="mt-8 text-center text-sm text-muted-foreground">
        Already have an account?{' '}
        <Link to="/login" className="text-primary hover:text-primary/80 font-semibold hover:underline transition">
          Sign In
        </Link>
      </div>
    </>
  );
};
