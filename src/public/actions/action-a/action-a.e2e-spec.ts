import { INestApplication } from "@nestjs/common"
import { Test, TestingModule } from "@nestjs/testing"
import request from "supertest"
import { ActionAModule } from "./action-a.module"
import { CreateActionADto } from "./dto/create-action-a.dto"
import { ACTION_A_SERVICE_TOKEN } from "./action-a.providers"
import { ActionAService } from "./action-a.service"
import { NotFoundError } from "src/error/not-found.error"
import { err, ok } from "neverthrow"

describe("ActionAController (e2e)", () => {
    let app: INestApplication
    let service: ActionAService

    beforeAll(async () => {
        const moduleFixture: TestingModule = await Test.createTestingModule({
            imports: [ActionAModule]
        }).compile()

        service = moduleFixture.get<ActionAService>(ACTION_A_SERVICE_TOKEN)
        app = moduleFixture.createNestApplication()

        await app.init()
    })

    afterAll(async () => {
        await app.close()
    })

    describe("/POST action-a", () => {
        it("should execute action successfully", async () => {
            const createActionADto: CreateActionADto = {
                actionId: "123",
                description: "E2E Test"
            }

            const response = await request(app.getHttpServer())
                .post("/action-a")
                .send(createActionADto)
                .expect(201)

            expect(response.text).toBe(
                'Action A executed with action ID: 123 Optional description: "E2E Test"'
            )
        })

        it("should return 400 when actionId is missing", async () => {
            const createActionADto: CreateActionADto = {
                actionId: "",
                description: "E2E Test"
            }

            await request(app.getHttpServer())
                .post("/action-a")
                .send(createActionADto)
                .expect(400)
        })
    })

    describe("/POST action-a/async", () => {
        it("should execute async action successfully", async () => {
            const createActionADto: CreateActionADto = {
                actionId: "123",
                description: "Async E2E Test"
            }

            jest.spyOn(service, "simulateAsyncOperation").mockResolvedValueOnce(
                ok(undefined)
            )

            const response = await request(app.getHttpServer())
                .post("/action-a/async")
                .send(createActionADto)
                .expect(201)

            expect(response.text).toBe(
                'Async action completed for action ID: 123 Optional description: "Async E2E Test"'
            )
        })

        it("should return 404 when async action fails with NotFoundError", async () => {
            const createActionADto: CreateActionADto = {
                actionId: "123",
                description: "Async E2E Test"
            }

            jest.spyOn(service, "simulateAsyncOperation").mockResolvedValueOnce(
                err(new NotFoundError("Simulated async not found"))
            )

            await request(app.getHttpServer())
                .post("/action-a/async")
                .send(createActionADto)
                .expect(404)
        })
    })
})
