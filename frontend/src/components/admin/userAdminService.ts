import { queryOptions } from "@tanstack/react-query"

import { type UserCreate, UsersService, type UserUpdate } from "@/client"

export const keys = {
    users: ["users"],
}

export function usersQuery() {
    return queryOptions({
        queryKey: keys.users,
        queryFn: async () =>
            (await UsersService.readUsers({ query: { skip: 0, limit: 100 } }))
                .data,
    })
}

export function createUser({
    confirm_password: _,
    ...body
}: UserCreate & { confirm_password?: string }) {
    return UsersService.createUser({ body })
}

// Leaves the password alone unless a new one was typed
export function updateUser(
    userId: string,
    {
        confirm_password: _,
        password,
        ...body
    }: UserUpdate & {
        confirm_password?: string
    },
) {
    return UsersService.updateUser({
        path: { user_id: userId },
        body: password ? { ...body, password } : body,
    })
}

export function deleteUser(userId: string) {
    return UsersService.deleteUser({ path: { user_id: userId } })
}
