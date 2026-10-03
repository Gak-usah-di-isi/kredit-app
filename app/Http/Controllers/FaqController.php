<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class FaqController extends Controller
{
    /**
     * Menampilkan halaman Pusat Bantuan & Tanya Jawab (FAQ).
     */
    public function index(): Response
    {
        return Inertia::render('FAQ');
    }
}
