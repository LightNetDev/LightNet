import { expect } from "@playwright/test"

import { lightnetTest } from "./test-utils"

const test = lightnetTest("./fixtures/basics/")

test("Should not show `Edit` button on details page by default.", async ({
  page,
  startLightnet,
}) => {})

test("Should show `Edit` button on book details page after visiting `/en/admin/` path.", async ({
  page,
  startLightnet,
}) => {})

test("Should show `Edit` button on video details page after visiting `/en/admin/` path.", async ({
  page,
  startLightnet,
}) => {})

test("Should show `Edit` button on audio details page after visiting `/en/admin/` path.", async ({
  page,
  startLightnet,
}) => {})

test("Edit button on details page should navigate to media item edit page", async ({
  page,
  startLightnet,
}) => {})
