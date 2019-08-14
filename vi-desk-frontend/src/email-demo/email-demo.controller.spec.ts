import { Test, TestingModule } from '@nestjs/testing';
import { EmailDemoController } from './email-demo.controller';

describe('EmailDemo Controller', () => {
  let controller: EmailDemoController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [EmailDemoController],
    }).compile();

    controller = module.get<EmailDemoController>(EmailDemoController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
