import {BaseService} from '@core/service'
import {IOtp} from '@app/user/packages/otp/OtpModel'
import {OtpRepository} from '@app/user/packages/otp/OtpRepository'
import {OtpTarget} from '@app/user/packages/otp/OtpTarget'
import {OtpUtils} from '@app/user/packages/otp/OtpUtils'
import {BaseRepositoryError} from '@core/repository'


export class OtpService extends BaseService<IOtp, OtpRepository> {

  constructor(
    repository: OtpRepository,
    private randomGenerator = OtpUtils.createRandomGenerator()
  ) {
    super(repository)
  }

  /**
   * @deprecated
   */
  private async createOtp(phone: string, target: OtpTarget, retry = 5): Promise<IOtp> {
    try {
      const code = this.randomGenerator()
      return await this.repository.create({
        phone: phone,
        target: target,
        code: code
      })
    } catch (error) {
      if (retry === 0 || !(error instanceof BaseRepositoryError.UniqueKeyError)) {
        throw error
      }
      return await this.createOtp(phone, target, retry - 1)
    }
  }

  /**
   * @deprecated
   */
  public async createCode(phone: string, target: OtpTarget): Promise<string> {
    const otp = await this.createOtp(phone, target)
    return otp.code
  }

  public async isExists(phone: string, code: string, target: OtpTarget): Promise<boolean> {
    const doc = await this.repository.isExists(phone, code, target)
    return doc !== null
  }

  public async deleteOtp(phone: string, code: string, target: OtpTarget): Promise<void> {
    await this.repository.deleteOtp(phone, code, target)
  }

  async findLastTimestamp(phone: string, target: OtpTarget.SIGN_IN): Promise<number | null> {
    const otp = await this.repository.findLastCreatedAt(phone, target)
    return otp === null ? null : otp.createdAt.getTime()
  }
}