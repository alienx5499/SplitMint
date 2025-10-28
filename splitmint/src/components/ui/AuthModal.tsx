"use client";
import React, { useState } from "react";
import { motion } from "motion/react";
import { Mail, ExternalLink, User } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "./dialog";
import { Button } from "./button";

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLogin: (method: 'email' | 'gmail') => void;
}

const authMethods = [
  {
    id: "email",
    name: "Login with Email",
    description: "Sign in using your email address",
    icon: "📧",
    color: "hover:bg-blue-50 hover:border-blue-300"
  },
  {
    id: "gmail",
    name: "Login with Gmail",
    description: "Sign in using your Google account",
    icon: "🔐",
    color: "hover:bg-red-50 hover:border-red-300"
  }
];

export const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose, onLogin }) => {
  const handleAuthSelect = (method: 'email' | 'gmail') => {
    onLogin(method);
    onClose();
  };

  return (
    <Dialog
      open={isOpen}
      onOpenChange={(open) => {
        // Only invoke onClose when Dialog requests to close
        if (!open) onClose();
      }}
    >
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <User className="w-5 h-5" />
            Sign In to SplitMint
          </DialogTitle>
          <DialogDescription>
            Choose your preferred method to sign in to your account
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-3 max-h-96 overflow-y-auto">
          {authMethods.map((method) => (
            <motion.div
              key={method.id}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <Button
                variant="outline"
                className={`w-full h-auto p-4 justify-start gap-4 ${method.color}`}
                onClick={() => handleAuthSelect(method.id as 'email' | 'gmail')}
              >
                <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center">
                  <span className="text-xl">{method.icon}</span>
                </div>
                <div className="flex-1 text-left">
                  <div className="font-medium">{method.name}</div>
                  <div className="text-sm text-muted-foreground">{method.description}</div>
                </div>
                <ExternalLink className="w-4 h-4 text-muted-foreground" />
              </Button>
            </motion.div>
          ))}
        </div>

        <div className="text-xs text-muted-foreground text-center pt-4 border-t">
          By signing in, you agree to our Terms of Service and Privacy Policy.
        </div>
      </DialogContent>
    </Dialog>
  );
};
