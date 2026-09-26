<?php

namespace App\Http\Middleware;

use Illuminate\Http\Request;
use Inertia\Middleware;

class HandleInertiaRequests extends Middleware
{
    /**
     * The root template that is loaded on the first page visit.
     *
     * @var string
     */
    protected $rootView = 'app';

    /**
     * Determine the current asset version.
     */
    public function version(Request $request): ?string
    {
        return parent::version($request);
    }

    /**
     * Define the props that are shared by default.
     *
     * @return array<string, mixed>
     */
    public function share(Request $request): array
    {
        $user = $request->user();

        return [
            ...parent::share($request),
            'auth' => [
                'user' => $user,
            ],
            'authUser' => $user,
            'authRoles' => $user ? $user->getRoles() : [],
            'authRoleDetails' => $user ? $user->roles->map(fn($r) => [
                'name' => $r->name,
                'display_name' => $r->display_name,
            ]) : [],
            'flash' => [
                'success' => $request->session()->get('success'),
                'error'   => $request->session()->get('error'),
                'warning' => $request->session()->get('warning'),
                'info'    => $request->session()->get('info'),
                'status'  => $request->session()->get('status'),
                'type'    => $request->session()->get('success') ? 'success' : ($request->session()->get('error') ? 'error' : ($request->session()->get('warning') ? 'warning' : ($request->session()->get('info') ? 'info' : null))),
                'message' => $request->session()->get('success') ?? $request->session()->get('error') ?? $request->session()->get('warning') ?? $request->session()->get('info') ?? $request->session()->get('status'),
            ],
        ];
    }
}
