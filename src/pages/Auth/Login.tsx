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

const loginSchema = yup.object().shape({
  username: yup.string()
    .required('Username is required')
    .min(3, 'Username must be at least 3 characters'),
  password: yup.string()
    .required('Password is required')
    .min(6, 'Password must be at least 6 characters'),
});

type LoginFormInputs = yup.InferType<typeof loginSchema>;

export const Login: React.FC = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const { register, handleSubmit, formState: { errors } } = useForm<LoginFormInputs>({
    resolver: yupResolver(loginSchema) as any
  });

  const onSubmit = async (data: LoginFormInputs) => {
    setLoading(true);
    try {
      const success = await login({
        username: data.username!,
        password: data.password,
      });
      if (success) {
        toast.success('Signed in successfully!');
        navigate('/');
      } else {
        toast.error('Invalid username or password.');
      }
    } catch (err) {
      toast.error('An unexpected error occurred.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <h2 className="text-xl font-semibold mb-6 text-center">Sign In</h2>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 mt-5">
        {/* Username */}
        <div className="space-y-1">
          <Label htmlFor="username" className="text-xs text-muted-foreground pl-1">Username</Label>
          <Input
            id="username"
            type="text"
            className="h-11"
            placeholder="Enter username (e.g. dev)"
            autoComplete="username"
            spellCheck={false}
            {...register('username')}
          />
          {errors.username ? (
            <p className="text-destructive text-[10px] pl-1">{errors.username.message}</p>
          ) : null}
        </div>

        {/* Password */}
        <div className="space-y-1">
          <div className="flex justify-between items-center px-1">
            <Label htmlFor="password" className="text-xs text-muted-foreground block">Password</Label>
          </div>
          <Input
            id="password"
            type="password"
            placeholder="••••••••"
            className="h-11"
            autoComplete="current-password"
            {...register('password')}
          />
          {errors.password ? (
            <p className="text-destructive text-[10px] pl-1">{errors.password.message}</p>
          ) : null}
        </div>

        {/* Submit */}
        <Button
          type="submit"
          disabled={loading}
          className="w-full h-11 font-semibold"
        >
          {loading ? 'Signing In ...' : 'Submit'}
        </Button>
      </form>

      <div className="mt-6 text-center">
        <p className="text-xs text-muted-foreground">
          Don't have an account?{' '}
          <Link to="/register" className="text-primary hover:text-primary/80 font-semibold underline transition">
            Sign Up
          </Link>
        </p>
      </div>
    </>
  );
};
