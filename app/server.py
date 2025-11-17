"""
Server entry point for supervisor compatibility.
Imports app from main.py to work with supervisor config.
"""
from main import app

__all__ = ['app']
